<template>
  <div class="min-h-full pb-8">
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="text-white text-2xl" @click="router.back()">←</button>
      <h1 class="text-white text-xl font-bold">My Applications</h1>
    </div>

    <!-- Status filter tabs -->
    <div class="flex gap-2 px-4 py-3 overflow-x-auto">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        class="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
        :class="statusFilter === tab.value
          ? 'bg-nhs-blue text-white border-nhs-blue'
          : 'bg-white text-gray-600 border-gray-200'"
        @click="statusFilter = tab.value"
      >{{ tab.label }}</button>
    </div>

    <div class="px-4 space-y-3">
      <div v-if="loading" class="text-center py-16 text-gray-400">Loading…</div>
      <div v-else-if="filtered.length === 0" class="text-center py-16">
        <p class="text-4xl mb-3">📋</p>
        <p class="font-medium text-gray-600">No applications here</p>
        <RouterLink to="/jobs" class="btn-primary mt-5 !w-auto px-6 inline-flex">Find Jobs</RouterLink>
      </div>
      <div
        v-for="app in filtered"
        :key="app.id"
        class="card cursor-pointer active:scale-98 transition-transform"
        @click="viewing = app"
      >
        <div class="flex justify-between items-start gap-2 mb-2">
          <p class="font-semibold text-gray-900 leading-snug flex-1">{{ app.job?.title ?? 'Job' }}</p>
          <span :class="statusBadge(app.status)" class="flex-shrink-0 text-xs capitalize">{{ app.status }}</span>
        </div>
        <p class="text-sm text-gray-600">{{ app.job?.organisation }}</p>
        <p class="text-xs text-gray-400 mt-2">Applied {{ formatDate(app.created_at) }}</p>
      </div>
    </div>

    <!-- Detail sheet -->
    <Teleport to="body">
      <div v-if="viewing" class="fixed inset-0 z-50 bg-white overflow-y-auto">
        <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
          <button class="text-white text-2xl" @click="viewing = null">←</button>
          <h2 class="text-white font-bold truncate flex-1">Application</h2>
        </div>

        <div class="px-4 py-5 space-y-4">
          <div class="card">
            <p class="text-xl font-bold text-gray-900">{{ viewing.job?.title }}</p>
            <p class="text-gray-600 mt-0.5">{{ viewing.job?.organisation }}</p>
            <span :class="statusBadge(viewing.status)" class="mt-3 inline-flex capitalize text-xs">
              {{ viewing.status }}
            </span>
          </div>

          <!-- Status timeline -->
          <div class="card">
            <p class="font-semibold text-gray-800 mb-4">Status History</p>
            <div class="space-y-0">
              <div
                v-for="(event, i) in viewing.status_history ?? []"
                :key="i"
                class="flex gap-3"
              >
                <div class="flex flex-col items-center">
                  <div class="w-3 h-3 rounded-full mt-1 flex-shrink-0" :class="i === 0 ? 'bg-nhs-blue' : 'bg-gray-300'" />
                  <div v-if="i < (viewing.status_history?.length ?? 1) - 1" class="w-0.5 flex-1 bg-gray-200 my-1" />
                </div>
                <div class="pb-4">
                  <p class="font-medium text-sm text-gray-900 capitalize">{{ event.status }}</p>
                  <p class="text-xs text-gray-400">{{ formatDate(event.created_at) }}</p>
                  <p v-if="event.notes" class="text-sm text-gray-600 mt-1">{{ event.notes }}</p>
                </div>
              </div>
              <div v-if="!viewing.status_history?.length" class="text-sm text-gray-400">No history available.</div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="viewing.notes" class="card">
            <p class="font-semibold text-gray-800 mb-2">Notes</p>
            <p class="text-sm text-gray-600">{{ viewing.notes }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { applicationsApi } from '@/api'

interface StatusEvent { status: string; created_at: string; notes?: string }
interface Application {
  id: number
  status: string
  notes?: string
  created_at: string
  job?: { title: string; organisation: string }
  status_history?: StatusEvent[]
}

const router       = useRouter()
const applications = ref<Application[]>([])
const loading      = ref(true)
const statusFilter = ref('')
const viewing      = ref<Application | null>(null)

const statusTabs = [
  { label: 'All',        value: '' },
  { label: 'Applied',    value: 'applied' },
  { label: 'Shortlisted',value: 'shortlisted' },
  { label: 'Interview',  value: 'interview' },
  { label: 'Offered',    value: 'offered' },
  { label: 'Rejected',   value: 'rejected' },
]

const filtered = computed(() =>
  statusFilter.value
    ? applications.value.filter(a => a.status === statusFilter.value)
    : applications.value,
)

const statusBadge = (s: string) => ({
  applied:     'badge-blue',
  shortlisted: 'badge-amber',
  interview:   'badge-blue',
  offered:     'badge-green',
  rejected:    'badge-red',
  withdrawn:   'badge-gray',
}[s] ?? 'badge-gray')

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

onMounted(async () => {
  try {
    const res          = await applicationsApi.list()
    applications.value = res.data.data?.data ?? res.data.data
  } finally { loading.value = false }
})
</script>
