<template>
  <div class="min-h-full">
    <!-- Header -->
    <div class="bg-nhs-blue safe-top px-5 pt-12 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-blue-200 text-sm">Welcome back,</p>
          <h1 class="text-white text-2xl font-bold">{{ auth.user?.name?.split(' ')[0] ?? 'Doctor' }} 👋</h1>
        </div>
        <RouterLink to="/notifications" class="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <span class="text-xl">🔔</span>
          <span v-if="unreadNotifications > 0"
            class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-nhs-red text-white text-xs flex items-center justify-center font-bold">
            {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
          </span>
        </RouterLink>
      </div>
    </div>

    <div class="px-4 py-5 space-y-5 -mt-3">
      <!-- Quick stats -->
      <div class="grid grid-cols-2 gap-3">
        <div class="card text-center">
          <p class="text-3xl font-bold text-nhs-blue">{{ savedCount }}</p>
          <p class="text-xs text-gray-500 mt-1">Saved Jobs</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-nhs-green">{{ appCount }}</p>
          <p class="text-xs text-gray-500 mt-1">Applications</p>
        </div>
      </div>

      <!-- Job search shortcut -->
      <div class="card bg-nhs-blue text-white !py-5">
        <p class="font-semibold text-lg">Find your next role</p>
        <p class="text-blue-200 text-sm mt-1 mb-4">Browse thousands of NHS and healthcare jobs across the UK</p>
        <RouterLink to="/jobs" class="inline-block bg-white text-nhs-blue font-semibold text-sm px-5 py-2.5 rounded-xl">
          Search Jobs →
        </RouterLink>
      </div>

      <!-- Tools -->
      <div>
        <h2 class="text-base font-semibold text-gray-800 mb-3">Career Tools</h2>
        <div class="grid grid-cols-2 gap-3">
          <RouterLink
            v-for="tool in tools"
            :key="tool.name"
            :to="tool.to"
            class="card flex flex-col gap-2 active:scale-95 transition-transform"
          >
            <span class="text-3xl">{{ tool.icon }}</span>
            <p class="font-semibold text-sm text-gray-800">{{ tool.name }}</p>
            <p class="text-xs text-gray-500">{{ tool.desc }}</p>
            <span v-if="tool.premium" class="badge bg-amber-100 text-amber-700 self-start text-xs">Pro</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { applicationsApi, jobsApi, notificationsApi } from '@/api'

const auth                = useAuthStore()
const savedCount          = ref(0)
const appCount            = ref(0)
const unreadNotifications = ref(0)

const tools = [
  { name: 'CV Analysis',    icon: '📄', desc: 'AI-powered CV review',          to: '/tools', premium: true  },
  { name: 'Interview Prep', icon: '🎤', desc: 'Practice interview questions',   to: '/tools', premium: false },
  { name: 'Statements',     icon: '✍️',  desc: 'Generate supporting statements', to: '/tools', premium: true  },
  { name: 'Video Library',  icon: '🎬', desc: 'Career guidance videos',         to: '/tools', premium: false },
]

onMounted(async () => {
  try {
    const [apps, saved, notifs] = await Promise.all([
      applicationsApi.list(),
      jobsApi.list({ saved: true }),
      notificationsApi.list(),
    ])
    appCount.value            = apps.data.data?.total ?? apps.data.data?.length ?? 0
    savedCount.value          = saved.data.data?.total ?? saved.data.data?.length ?? 0
    const notifList           = notifs.data.data as { read_at: string | null }[]
    unreadNotifications.value = notifList.filter(n => !n.read_at).length
  } catch { /* show zeros */ }
})
</script>
