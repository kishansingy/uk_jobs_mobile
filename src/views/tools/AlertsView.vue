<template>
  <div class="min-h-full pb-8">
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="text-white text-2xl" @click="router.back()">←</button>
      <h1 class="text-white text-xl font-bold">Job Alerts</h1>
    </div>

    <div class="px-4 py-5 space-y-4">
      <!-- Free limit warning -->
      <div v-if="sub.isFree && alerts.length >= 2" class="card bg-amber-50 border border-amber-200">
        <p class="text-sm font-semibold text-amber-800">⚠️ Free plan limit reached</p>
        <p class="text-xs text-amber-700 mt-1 mb-3">You can have up to 2 alerts on the free plan. Upgrade to Pro for unlimited alerts.</p>
        <RouterLink to="/plans" class="inline-block text-sm font-semibold text-nhs-blue">Upgrade to Pro →</RouterLink>
      </div>

      <!-- Add alert form -->
      <div class="card space-y-3" v-if="!sub.isFree || alerts.length < 2">
        <p class="font-semibold text-gray-800">Create an Alert</p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
          <input v-model="form.keywords" class="input" placeholder="e.g. Band 5 Nurse, Midwife" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input v-model="form.location" class="input" placeholder="e.g. London, Manchester" />
        </div>
        <button class="btn-primary" :disabled="!form.keywords || saving" @click="createAlert">
          {{ saving ? 'Saving…' : '+ Create Alert' }}
        </button>
      </div>

      <!-- Alert list -->
      <div v-if="loading" class="text-center py-10 text-gray-400">Loading…</div>
      <div v-else-if="alerts.length === 0" class="text-center py-10 text-gray-400">
        No alerts set up yet.
      </div>
      <div v-else class="space-y-3">
        <div v-for="alert in alerts" :key="alert.id" class="card flex items-center gap-3">
          <span class="text-2xl">🔔</span>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 text-sm">{{ alert.keywords }}</p>
            <p v-if="alert.location" class="text-xs text-gray-500">📍 {{ alert.location }}</p>
          </div>
          <button class="text-nhs-red text-sm" @click="deleteAlert(alert.id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { alertsApi } from '@/api'
import { useSubscriptionStore } from '@/stores/subscription'

interface Alert { id: number; keywords: string; location?: string }

const router  = useRouter()
const sub     = useSubscriptionStore()
const alerts  = ref<Alert[]>([])
const loading = ref(true)
const saving  = ref(false)
const form    = ref({ keywords: '', location: '' })

async function loadAlerts() {
  loading.value = true
  try {
    const res  = await alertsApi.list()
    alerts.value = res.data.data
  } finally { loading.value = false }
}

async function createAlert() {
  saving.value = true
  try {
    await alertsApi.store({ keywords: form.value.keywords, location: form.value.location || undefined })
    form.value = { keywords: '', location: '' }
    await loadAlerts()
  } finally { saving.value = false }
}

async function deleteAlert(id: number) {
  await alertsApi.destroy(id)
  alerts.value = alerts.value.filter(a => a.id !== id)
}

onMounted(() => loadAlerts())
</script>
