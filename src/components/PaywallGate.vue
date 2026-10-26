<template>
  <div class="relative">
    <!-- Content (blurred when locked) -->
    <div :class="locked ? 'pointer-events-none select-none blur-sm opacity-40' : ''">
      <slot />
    </div>

    <!-- Lock overlay -->
    <Transition name="fade">
      <div
        v-if="locked"
        class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-2xl px-6 text-center"
      >
        <span class="text-5xl mb-3">🔒</span>
        <p class="font-bold text-gray-900 text-lg">{{ title }}</p>
        <p class="text-sm text-gray-500 mt-1 mb-5">{{ message }}</p>
        <RouterLink
          to="/plans"
          class="inline-block bg-nhs-blue text-white font-semibold text-sm px-6 py-3 rounded-xl"
        >
          Upgrade to {{ requiredPlan }}
        </RouterLink>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSubscriptionStore } from '@/stores/subscription'

const props = withDefaults(defineProps<{
  feature?: string          // feature key e.g. 'cv_analysis'
  plan?: 'pro' | 'premium'  // or lock by plan tier
  title?: string
  message?: string
}>(), {
  title:   'Premium Feature',
  message: 'Upgrade your plan to unlock this feature.',
})

const sub = useSubscriptionStore()

const locked = computed(() => {
  if (props.feature) return !sub.hasFeature(props.feature)
  if (props.plan === 'premium') return !sub.isPremium
  if (props.plan === 'pro')     return !sub.isPro
  return false
})

const requiredPlan = computed(() => props.plan === 'premium' ? 'Premium' : 'Pro')
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
