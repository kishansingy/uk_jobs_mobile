<template>
  <div class="min-h-screen bg-gray-50 pb-10">
    <!-- Header -->
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-6 text-center">
      <button class="absolute left-4 top-14 text-white text-2xl" @click="router.back()">←</button>
      <h1 class="text-white text-2xl font-bold">Choose your plan</h1>
      <p class="text-blue-200 text-sm mt-1">Start free, upgrade when you're ready</p>
    </div>

    <div class="px-4 pt-5 space-y-5">
      <!-- Billing toggle -->
      <div class="flex items-center justify-center gap-3">
        <span :class="period === 'monthly' ? 'text-gray-900 font-semibold' : 'text-gray-400'" class="text-sm">Monthly</span>
        <button
          class="w-12 h-6 rounded-full transition-colors relative"
          :class="period === 'annual' ? 'bg-nhs-blue' : 'bg-gray-300'"
          @click="period = period === 'monthly' ? 'annual' : 'monthly'"
        >
          <span
            class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
            :class="period === 'annual' ? 'translate-x-6' : 'translate-x-0.5'"
          />
        </button>
        <span :class="period === 'annual' ? 'text-gray-900 font-semibold' : 'text-gray-400'" class="text-sm">
          Annual <span class="text-nhs-green text-xs font-bold">Save 17%</span>
        </span>
      </div>

      <!-- Plan cards -->
      <div v-if="loading" class="text-center py-10 text-gray-400">Loading plans…</div>
      <template v-else>
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="card border-2 transition-all"
          :class="plan.slug === 'pro' ? 'border-nhs-blue shadow-lg' : 'border-transparent'"
        >
          <!-- Most popular badge -->
          <div v-if="plan.slug === 'pro'" class="flex justify-between items-center mb-3">
            <span class="badge bg-nhs-blue text-white text-xs font-bold px-3 py-1">Most Popular</span>
          </div>

          <div class="flex justify-between items-start mb-1">
            <div>
              <p class="text-xl font-bold text-gray-900">{{ plan.name }}</p>
              <p class="text-sm text-gray-500 mt-0.5">{{ plan.description }}</p>
            </div>
            <div class="text-right">
              <template v-if="plan.price_monthly === 0">
                <p class="text-2xl font-bold text-gray-900">Free</p>
              </template>
              <template v-else>
                <p class="text-2xl font-bold text-gray-900">
                  £{{ price(plan) }}<span class="text-sm font-normal text-gray-400">/mo</span>
                </p>
                <p v-if="period === 'annual'" class="text-xs text-nhs-green">
                  £{{ plan.price_annual }}/yr billed annually
                </p>
              </template>
            </div>
          </div>

          <!-- Features -->
          <ul class="mt-4 space-y-2">
            <li v-for="f in featureLabels(plan)" :key="f.key" class="flex items-center gap-2 text-sm">
              <span :class="f.enabled ? 'text-nhs-green' : 'text-gray-300'">{{ f.enabled ? '✓' : '✕' }}</span>
              <span :class="f.enabled ? 'text-gray-800' : 'text-gray-400'">{{ f.label }}</span>
              <span v-if="f.limit" class="ml-auto text-xs font-semibold text-gray-500">{{ f.limit }}</span>
            </li>
          </ul>

          <!-- CTA -->
          <div class="mt-5">
            <template v-if="isCurrent(plan)">
              <button class="w-full py-3 rounded-xl bg-gray-100 text-gray-500 font-semibold text-sm" disabled>
                Current Plan
              </button>
            </template>
            <template v-else-if="plan.price_monthly === 0">
              <button class="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm" disabled>
                Free — No payment needed
              </button>
            </template>
            <template v-else>
              <button
                class="w-full py-3 rounded-xl font-semibold text-sm transition-colors"
                :class="plan.slug === 'pro' ? 'bg-nhs-blue text-white' : 'border-2 border-nhs-blue text-nhs-blue'"
                @click="goToCheckout(plan)"
              >
                Get {{ plan.name }} →
              </button>
            </template>
          </div>
        </div>
      </template>

      <!-- Cancel existing -->
      <div v-if="sub.current && !sub.isFree" class="text-center">
        <button class="text-sm text-gray-400 underline" @click="showCancelConfirm = true">
          Cancel current subscription
        </button>
      </div>
    </div>

    <!-- Cancel confirm sheet -->
    <Teleport to="body">
      <div
        v-if="showCancelConfirm"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
        @click.self="showCancelConfirm = false"
      >
        <div class="bg-white rounded-t-3xl w-full max-w-lg p-6 space-y-4">
          <h3 class="text-lg font-bold text-gray-900">Cancel subscription?</h3>
          <p class="text-sm text-gray-600">You'll keep access until the end of your billing period, then revert to Free.</p>
          <button class="btn-danger" @click="handleCancel">Yes, cancel my subscription</button>
          <button class="btn-secondary" @click="showCancelConfirm = false">Keep my subscription</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscription'
import type { Plan } from '@/stores/subscription'

const router           = useRouter()
const sub              = useSubscriptionStore()
const plans            = ref<Plan[]>([])
const loading          = ref(true)
const period           = ref<'monthly' | 'annual'>('monthly')
const showCancelConfirm = ref(false)

const price = (plan: Plan) =>
  period.value === 'annual'
    ? (plan.price_annual / 12).toFixed(2)
    : plan.price_monthly.toFixed(2)

const isCurrent = (plan: Plan) => sub.current?.plan?.slug === plan.slug

function featureLabels(plan: Plan) {
  const get = (key: string) => plan.features.find(f => f.key === key)?.value ?? 'false'
  return [
    { key: 'job_alerts',          label: 'Job Alerts',              enabled: true,              limit: get('job_alerts') === 'unlimited' ? 'Unlimited' : `Up to ${get('job_alerts')}` },
    { key: 'saved_jobs',          label: 'Saved Jobs',              enabled: true,              limit: get('saved_jobs') === 'unlimited' ? 'Unlimited' : `Up to ${get('saved_jobs')}` },
    { key: 'cv_upload',           label: 'CV Upload',               enabled: get('cv_upload') === 'true',           limit: undefined },
    { key: 'cv_analysis',         label: 'AI CV Analysis',          enabled: get('cv_analysis') === 'true',         limit: undefined },
    { key: 'supporting_statement',label: 'AI Supporting Statements', enabled: get('supporting_statement') === 'true', limit: undefined },
    { key: 'interview_prep',      label: 'Interview Prep',          enabled: true,              limit: get('interview_prep') === 'full' ? 'Full Access' : 'Basic' },
    { key: 'video_library',       label: 'Video Library',           enabled: true,              limit: get('video_library') === 'full' ? 'Full Access' : 'Limited' },
    { key: 'advisor_access',      label: '1-to-1 Career Advisor',   enabled: get('advisor_access') === 'true',      limit: undefined },
  ]
}

function goToCheckout(plan: Plan) {
  router.push(`/checkout/${plan.id}/${period.value}`)
}

async function handleCancel() {
  await sub.cancel()
  showCancelConfirm.value = false
}

onMounted(async () => {
  loading.value = true
  await Promise.all([sub.fetchPlans(), sub.fetchCurrent()])
  plans.value   = sub.plans
  loading.value = false
})
</script>
