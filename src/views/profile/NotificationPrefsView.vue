<template>
  <div class="min-h-full pb-8">
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="text-white text-2xl" @click="router.back()">←</button>
      <h1 class="text-white text-xl font-bold">Notification Settings</h1>
    </div>

    <div class="px-4 py-5 space-y-4">
      <div v-if="loading" class="space-y-3">
        <SkeletonCard v-for="i in 4" :key="i" />
      </div>

      <div v-else class="card !p-0 overflow-hidden divide-y divide-gray-100">
        <div
          v-for="pref in prefs"
          :key="pref.key"
          class="flex items-center justify-between px-4 py-4"
        >
          <div class="flex-1 min-w-0 pr-4">
            <p class="text-sm font-semibold text-gray-900">{{ pref.label }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ pref.desc }}</p>
          </div>
          <button
            class="w-12 h-6 rounded-full transition-colors relative flex-shrink-0"
            :class="pref.enabled ? 'bg-nhs-blue' : 'bg-gray-300'"
            @click="toggle(pref)"
          >
            <span
              class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              :class="pref.enabled ? 'translate-x-6' : 'translate-x-0.5'"
            />
          </button>
        </div>
      </div>

      <p class="text-xs text-gray-400 text-center">
        Changes are saved automatically
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/client'
import SkeletonCard from '@/components/SkeletonCard.vue'

interface Pref { key: string; label: string; desc: string; enabled: boolean }

const router  = useRouter()
const loading = ref(true)

const defaultPrefs: Omit<Pref, 'enabled'>[] = [
  { key: 'job_alerts',    label: 'Job Alerts',         desc: 'New jobs matching your saved alerts' },
  { key: 'applications',  label: 'Application Updates', desc: 'Status changes on your applications' },
  { key: 'messages',      label: 'Advisor Messages',    desc: 'Messages from your career advisor' },
  { key: 'promotions',    label: 'Tips & Promotions',   desc: 'Career tips and platform updates' },
]

const prefs = ref<Pref[]>([])

async function toggle(pref: Pref) {
  pref.enabled = !pref.enabled
  try {
    await api.patch('/notifications/preferences', { [pref.key]: pref.enabled })
  } catch {
    pref.enabled = !pref.enabled // revert on failure
  }
}

onMounted(async () => {
  try {
    const res      = await api.get('/notifications/preferences')
    const serverMap = res.data.data as Record<string, boolean>
    prefs.value = defaultPrefs.map(p => ({
      ...p,
      enabled: serverMap[p.key] ?? true,
    }))
  } catch {
    prefs.value = defaultPrefs.map(p => ({ ...p, enabled: true }))
  } finally { loading.value = false }
})
</script>
