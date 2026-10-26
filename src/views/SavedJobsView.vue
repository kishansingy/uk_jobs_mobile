<template>
  <div class="min-h-full">
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4">
      <h1 class="text-white text-xl font-bold">Saved Jobs</h1>
    </div>

    <div class="px-4 py-5 space-y-3">
      <div v-if="loading" class="text-center py-16 text-gray-400">Loading…</div>
      <div v-else-if="jobs.length === 0" class="text-center py-16 text-gray-400">
        <p class="text-4xl mb-3">🔖</p>
        <p class="font-medium text-gray-600">No saved jobs yet</p>
        <p class="text-sm mt-1">Browse jobs and tap Save to add them here</p>
        <RouterLink to="/jobs" class="btn-primary mt-5 !w-auto px-6 inline-flex">Browse Jobs</RouterLink>
      </div>
      <template v-else>
        <RouterLink
          v-for="job in jobs"
          :key="job.id"
          :to="`/jobs/${job.id}`"
          class="card block"
        >
          <p class="font-semibold text-gray-900">{{ job.title }}</p>
          <p class="text-sm text-gray-600 mt-0.5">{{ job.organisation }}</p>
          <div class="flex flex-wrap gap-2 mt-2">
            <span class="badge-gray text-xs">📍 {{ job.location }}</span>
            <span v-if="job.band" class="badge-blue text-xs">Band {{ job.band }}</span>
          </div>
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { jobsApi } from '@/api'

interface Job { id: number; title: string; organisation: string; location: string; band?: string }

const jobs    = ref<Job[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await jobsApi.list({ saved: true })
    jobs.value = res.data.data.data ?? res.data.data
  } finally { loading.value = false }
})
</script>
