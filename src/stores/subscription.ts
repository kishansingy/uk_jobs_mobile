import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { subscriptionsApi } from '@/api'

export interface PlanFeature { key: string; value: string }

export interface Plan {
  id: number
  name: string
  slug: 'free' | 'pro' | 'premium'
  description: string
  price_monthly: number
  price_annual: number
  currency: string
  features: PlanFeature[]
}

export interface ActiveSubscription {
  id: number
  plan: Plan
  billing_period: 'monthly' | 'annual'
  status: string
  starts_at: string
  ends_at: string | null
  cancelled_at: string | null
}

export const useSubscriptionStore = defineStore('subscription', () => {
  const plans       = ref<Plan[]>([])
  const current     = ref<ActiveSubscription | null>(null)
  const loading     = ref(false)

  // Derived
  const planSlug    = computed(() => current.value?.plan?.slug ?? 'free')
  const isPro       = computed(() => planSlug.value === 'pro' || planSlug.value === 'premium')
  const isPremium   = computed(() => planSlug.value === 'premium')
  const isFree      = computed(() => planSlug.value === 'free' || !current.value)

  function hasFeature(key: string): boolean {
    const features = current.value?.plan?.features ?? []
    const f = features.find(f => f.key === key)
    if (!f) return false
    return f.value === 'true' || f.value === 'full' || f.value === 'unlimited'
  }

  async function fetchPlans() {
    const res = await subscriptionsApi.plans()
    plans.value = res.data.data
  }

  async function fetchCurrent() {
    loading.value = true
    try {
      const res    = await subscriptionsApi.current()
      current.value = res.data.data ?? null
    } catch {
      current.value = null
    } finally {
      loading.value = false
    }
  }

  async function subscribe(planId: number, billingPeriod: 'monthly' | 'annual', paymentMethod: string) {
    const res = await subscriptionsApi.subscribe({ plan_id: planId, billing_period: billingPeriod, payment_method: paymentMethod })
    // Return client_secret for Stripe Elements confirmation
    return res.data.data as { client_secret?: string; provider_subscription_id: string }
  }

  async function cancel() {
    await subscriptionsApi.cancel()
    current.value = null
  }

  return { plans, current, loading, planSlug, isPro, isPremium, isFree, hasFeature, fetchPlans, fetchCurrent, subscribe, cancel }
})
