<template>
  <div class="min-h-screen bg-gray-50 pb-10">
    <!-- Header -->
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-5 relative">
      <button class="absolute left-4 top-14 text-white text-2xl" @click="router.back()">←</button>
      <h1 class="text-white text-xl font-bold text-center">Complete Payment</h1>
    </div>

    <div v-if="!plan" class="text-center py-20 text-gray-400">Loading…</div>

    <div v-else class="px-4 pt-5 space-y-5">
      <!-- Order summary -->
      <div class="card">
        <p class="text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Order Summary</p>
        <div class="flex justify-between items-center">
          <div>
            <p class="font-bold text-gray-900">{{ plan.name }} Plan</p>
            <p class="text-sm text-gray-500 capitalize">{{ period }} billing</p>
          </div>
          <div class="text-right">
            <p class="text-xl font-bold text-gray-900">£{{ totalPrice }}</p>
            <p class="text-xs text-gray-400">{{ period === 'annual' ? 'per year' : 'per month' }}</p>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          <span class="text-nhs-green text-sm">✓</span>
          <span class="text-xs text-gray-500">Cancel anytime — no hidden fees</span>
        </div>
      </div>

      <!-- Stripe card element -->
      <div class="card space-y-4">
        <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Payment Details</p>

        <div v-if="!stripeReady" class="text-center py-6 text-gray-400 text-sm">
          Loading payment form…
        </div>

        <!-- Stripe mounts here -->
        <div id="stripe-card-element" class="p-3 border border-gray-300 rounded-xl min-h-[44px]" />

        <p v-if="cardError" class="text-nhs-red text-sm">{{ cardError }}</p>

        <div class="flex items-center gap-2 text-xs text-gray-400">
          <span>🔒</span>
          <span>Secured by Stripe — we never store your card details</span>
        </div>
      </div>

      <!-- Pay button -->
      <button
        class="btn-primary py-4 text-base"
        :disabled="processing || !stripeReady"
        @click="handlePay"
      >
        {{ processing ? 'Processing…' : `Pay £${totalPrice}` }}
      </button>

      <p class="text-center text-xs text-gray-400">
        By continuing you agree to our Terms of Service
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscription'
import type { Plan } from '@/stores/subscription'

declare global {
  interface Window {
    Stripe?: (key: string) => StripeInstance
  }
}
interface StripeInstance {
  elements: () => StripeElements
  confirmCardPayment: (secret: string, data: object) => Promise<{ error?: { message: string } }>
}
interface StripeElements {
  create: (type: string, options?: object) => StripeElement
}
interface StripeElement {
  mount: (selector: string) => void
  destroy: () => void
}

const route      = useRoute()
const router     = useRouter()
const sub        = useSubscriptionStore()

const plan       = ref<Plan | null>(null)
const period     = computed(() => route.params.period as 'monthly' | 'annual')
const processing = ref(false)
const cardError  = ref('')
const stripeReady = ref(false)

let stripe: StripeInstance | null = null
let cardElement: StripeElement | null = null

const totalPrice = computed(() => {
  if (!plan.value) return '0.00'
  return period.value === 'annual'
    ? plan.value.price_annual.toFixed(2)
    : plan.value.price_monthly.toFixed(2)
})

function loadStripeScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Stripe) { resolve(); return }
    const script    = document.createElement('script')
    script.src      = 'https://js.stripe.com/v3/'
    script.onload   = () => resolve()
    document.head.appendChild(script)
  })
}

async function initStripe() {
  await loadStripeScript()
  const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  if (!key || !window.Stripe) return
  stripe      = window.Stripe(key)
  const elements = stripe.elements()
  cardElement = elements.create('card', {
    style: {
      base: { fontSize: '16px', color: '#111827', '::placeholder': { color: '#9CA3AF' } },
    },
  })
  cardElement.mount('#stripe-card-element')
  stripeReady.value = true
}

async function handlePay() {
  if (!stripe || !cardElement || !plan.value) return
  processing.value = true
  cardError.value  = ''

  try {
    // 1. Create subscription on backend → get client_secret
    const result = await sub.subscribe(plan.value.id, period.value, 'stripe')

    if (!result.client_secret) {
      // No payment intent needed (e.g. trial or zero-cost)
      await sub.fetchCurrent()
      router.push('/profile')
      return
    }

    // 2. Confirm payment with Stripe Elements
    const { error } = await stripe.confirmCardPayment(result.client_secret, {
      payment_method: { card: cardElement },
    })

    if (error) {
      cardError.value = error.message ?? 'Payment failed. Please try again.'
      return
    }

    // 3. Success
    await sub.fetchCurrent()
    router.replace('/plans?success=1')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    cardError.value = err.response?.data?.message ?? 'Something went wrong. Please try again.'
  } finally {
    processing.value = false
  }
}

onMounted(async () => {
  if (!sub.plans.length) await sub.fetchPlans()
  plan.value = sub.plans.find(p => p.id === Number(route.params.planId)) ?? null
  await initStripe()
})

onUnmounted(() => {
  cardElement?.destroy()
})
</script>
