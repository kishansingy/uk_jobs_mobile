<template>
  <div class="min-h-full pb-24">
    <!-- Back header -->
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="text-white text-2xl leading-none" @click="router.back()">←</button>
      <h1 class="text-white font-semibold truncate flex-1">Job Details</h1>
    </div>

    <div v-if="loading" class="text-center py-20 text-gray-400">Loading…</div>

    <div v-else-if="job" class="px-4 py-5 space-y-4">
      <!-- Title card -->
      <div class="card space-y-2">
        <h2 class="text-xl font-bold text-gray-900 leading-snug">{{ job.title }}</h2>
        <p class="text-gray-600 font-medium">{{ job.organisation }}</p>
        <div class="flex flex-wrap gap-2">
          <span class="badge-gray text-xs">📍 {{ job.location }}</span>
          <span v-if="job.band" class="badge-blue text-xs">Band {{ job.band }}</span>
          <span :class="statusBadge(job.status)" class="text-xs">{{ job.status }}</span>
        </div>
      </div>

      <!-- Salary / closing -->
      <div class="card grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-gray-500 mb-1">Salary</p>
          <p class="font-semibold text-gray-900">{{ job.salary_text ?? '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">Closing Date</p>
          <p class="font-semibold text-gray-900">{{ job.closing_date ? formatDate(job.closing_date) : '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">Contract</p>
          <p class="font-semibold text-gray-900 capitalize">{{ job.contract_type ?? '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">Employment</p>
          <p class="font-semibold text-gray-900 capitalize">{{ job.employment_type ?? '—' }}</p>
        </div>
      </div>

      <!-- Description -->
      <div v-if="job.description" class="card">
        <h3 class="font-semibold text-gray-800 mb-3">Description</h3>
        <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ job.description }}</p>
      </div>
    </div>

    <!-- Sticky action bar -->
    <div v-if="job" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom flex gap-3">
      <button
        class="flex-1 btn-secondary !w-auto"
        @click="toggleSave"
      >{{ saved ? '🔖 Saved' : '🔖 Save' }}</button>
      <a
        v-if="job.source_url"
        :href="job.source_url"
        target="_blank"
        class="flex-1 btn-primary !w-auto"
      >Apply →</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jobsApi } from '@/api'

interface JobDetail {
  id: number; title: string; organisation: string; location: string
  band?: string; salary_text?: string; status: string; closing_date?: string
  contract_type?: string; employment_type?: string; description?: string; source_url?: string
}

const route   = useRoute()
const router  = useRouter()
const job     = ref<JobDetail | null>(null)
const loading = ref(true)
const saved   = ref(false)

const statusBadge = (s: string) => ({
  active: 'badge-green', closing_soon: 'badge-amber', expired: 'badge-gray', removed: 'badge-red',
}[s] ?? 'badge-gray')

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

async function toggleSave() {
  if (!job.value) return
  try {
    if (saved.value) { await jobsApi.unsave(job.value.id); saved.value = false }
    else             { await jobsApi.save(job.value.id);   saved.value = true  }
  } catch { /* ignore */ }
}

onMounted(async () => {
  try {
    const res = await jobsApi.show(Number(route.params.id))
    job.value = res.data.data
  } finally { loading.value = false }
})
</script>
