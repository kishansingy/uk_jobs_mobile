<template>
  <div class="min-h-full">
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4">
      <h1 class="text-white text-xl font-bold">Career Tools</h1>
      <p class="text-blue-200 text-sm mt-0.5">
        <span v-if="sub.isFree">Free plan — <RouterLink to="/plans" class="underline text-white font-medium">upgrade for more</RouterLink></span>
        <span v-else class="capitalize">{{ sub.planSlug }} plan</span>
      </p>
    </div>

    <div class="px-4 py-5 space-y-3">
      <RouterLink
        v-for="tool in tools"
        :key="tool.name"
        :to="tool.route"
        class="card flex items-center gap-4 active:scale-98 transition-transform"
      >
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" :class="tool.iconBg">
          {{ tool.icon }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="font-semibold text-gray-900">{{ tool.name }}</p>
            <span v-if="tool.tier === 'pro'"     class="badge bg-amber-100 text-amber-700 text-xs">Pro</span>
            <span v-if="tool.tier === 'premium'" class="badge bg-purple-100 text-purple-700 text-xs">Premium</span>
            <span v-if="isLocked(tool)"          class="ml-auto text-base">🔒</span>
          </div>
          <p class="text-sm text-gray-500 mt-0.5 leading-snug">{{ tool.desc }}</p>
        </div>
        <span v-if="!isLocked(tool)" class="text-gray-300 text-xl">›</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSubscriptionStore } from '@/stores/subscription'

const sub = useSubscriptionStore()

const tools = [
  { name: 'Interview Prep',        icon: '🎤', iconBg: 'bg-blue-50',   desc: 'Practice with real NHS interview questions',        tier: 'free',    route: '/tools/interview' },
  { name: 'Video Library',         icon: '🎬', iconBg: 'bg-red-50',    desc: 'Watch career guidance and training videos',         tier: 'free',    route: '/tools/videos'    },
  { name: 'CV Analysis',           icon: '📄', iconBg: 'bg-green-50',  desc: 'AI-powered CV review with actionable feedback',     tier: 'pro',     route: '/tools/cv'        },
  { name: 'Supporting Statements', icon: '✍️',  iconBg: 'bg-amber-50',  desc: 'Generate tailored supporting statements for NHS',  tier: 'pro',     route: '/tools/statements'},
  { name: 'Career Advisor',        icon: '👩‍⚕️', iconBg: 'bg-purple-50', desc: 'Book 1-to-1 sessions with a career specialist',    tier: 'premium', route: '/tools/advisor'   },
  { name: 'Job Alerts',            icon: '🔔', iconBg: 'bg-sky-50',    desc: 'Get notified about new matching jobs',              tier: 'free',    route: '/tools/alerts'    },
] as const

function isLocked(tool: { tier: string }) {
  if (tool.tier === 'premium') return !sub.isPremium
  if (tool.tier === 'pro')     return !sub.isPro
  return false
}
</script>
