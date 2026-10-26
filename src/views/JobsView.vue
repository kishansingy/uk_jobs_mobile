<template>
  <div class="min-h-full">
    <!-- Header + search -->
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 space-y-3">
      <h1 class="text-white text-xl font-bold">Find Jobs</h1>
      <div class="flex gap-2">
        <input
          v-model="search"
          class="input flex-1"
          placeholder="Search title, org, location…"
        />
        <button
          class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
          :class="hasActiveFilters ? 'bg-white text-nhs-blue' : 'bg-white/20 text-white'"
          @click="showFilters = true"
        >
          <span class="text-lg">⚙️</span>
        </button>
      </div>
    </div>

    <!-- Contract type chips -->
    <div class="flex gap-2 px-4 py-3 overflow-x-auto">
      <button
        v-for="type in contractTypes"
        :key="type.value"
        class="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
        :class="filters.contract_type === type.value
          ? 'bg-nhs-blue text-white border-nhs-blue'
          : 'bg-white text-gray-600 border-gray-200'"
        @click="filters.contract_type = type.value; loadJobs(1)"
      >{{ type.label }}</button>
    </div>

    <!-- Offline banner -->
    <div v-if="!isOnline" class="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
      <span>⚠️</span>
      <p class="text-sm text-amber-800 font-medium">No internet connection</p>
    </div>

    <!-- Results count -->
    <div v-if="!loading && jobs.length" class="px-4 pb-1">
      <p class="text-xs text-gray-400">{{ totalJobs.toLocaleString() }} jobs found</p>
    </div>

    <!-- List -->
    <div class="px-4 pb-6 space-y-3">
      <div v-if="loading" class="space-y-3">
        <SkeletonCard v-for="i in 5" :key="i" />
      </div>
      <div v-else-if="jobs.length === 0" class="text-center py-16 text-gray-400">
        <p class="text-4xl mb-3">🔍</p>
        <p class="font-medium">No jobs found</p>
        <p class="text-sm mt-1">Try adjusting your filters</p>
        <button v-if="hasActiveFilters" class="btn-secondary !w-auto px-6 mt-4" @click="clearFilters">Clear Filters</button>
      </div>
      <template v-else>
        <RouterLink
          v-for="job in jobs"
          :key="job.id"
          :to="`/jobs/${job.id}`"
          class="card block active:scale-98 transition-transform"
        >
          <div class="flex justify-between items-start gap-2 mb-2">
            <p class="font-semibold text-gray-900 leading-snug flex-1">{{ job.title }}</p>
            <span :class="statusBadge(job.status)" class="flex-shrink-0 text-xs">{{ job.status }}</span>
          </div>
          <p class="text-sm text-gray-600">{{ job.organisation }}</p>
          <div class="flex flex-wrap gap-2 mt-3">
            <span class="badge-gray text-xs">📍 {{ job.location }}</span>
            <span v-if="job.band" class="badge-blue text-xs">Band {{ job.band }}</span>
            <span v-if="job.salary_text" class="badge-green text-xs">{{ job.salary_text }}</span>
            <span v-if="job.closing_date" class="badge-amber text-xs">Closes {{ formatDate(job.closing_date) }}</span>
            <span v-if="job.match_score" class="ml-auto badge bg-purple-100 text-purple-700 text-xs font-bold">
              {{ job.match_score }}% match
            </span>
          </div>
        </RouterLink>

        <div class="flex justify-center gap-4 pt-2">
          <button v-if="page > 1" class="btn-secondary !w-auto px-6" @click="loadJobs(page - 1)">← Prev</button>
          <button v-if="page < lastPage" class="btn-secondary !w-auto px-6" @click="loadJobs(page + 1)">Next →</button>
        </div>
      </template>
    </div>

    <!-- Filter sheet -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="showFilters" class="fixed inset-0 z-50 flex items-end" @click.self="showFilters = false">
          <div class="w-full bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto safe-bottom">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-900">Filter Jobs</h3>
              <button class="text-gray-400 text-2xl" @click="showFilters = false">✕</button>
            </div>

            <div class="px-5 py-4 space-y-5">
              <!-- Band -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">NHS Band</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="b in bands"
                    :key="b"
                    class="px-3 py-1.5 rounded-full text-sm border transition-colors"
                    :class="filters.band === b
                      ? 'bg-nhs-blue text-white border-nhs-blue'
                      : 'bg-white text-gray-600 border-gray-200'"
                    @click="filters.band = filters.band === b ? '' : b"
                  >Band {{ b }}</button>
                </div>
              </div>

              <!-- Employment type -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Employment Type</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="t in employmentTypes"
                    :key="t.value"
                    class="px-3 py-1.5 rounded-full text-sm border transition-colors"
                    :class="filters.employment_type === t.value
                      ? 'bg-nhs-blue text-white border-nhs-blue'
                      : 'bg-white text-gray-600 border-gray-200'"
                    @click="filters.employment_type = filters.employment_type === t.value ? '' : t.value"
                  >{{ t.label }}</button>
                </div>
              </div>

              <!-- Sponsorship -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-gray-700">Sponsorship Available</p>
                  <p class="text-xs text-gray-400">Only show jobs offering visa sponsorship</p>
                </div>
                <button
                  class="w-12 h-6 rounded-full transition-colors relative"
                  :class="filters.sponsorship ? 'bg-nhs-blue' : 'bg-gray-300'"
                  @click="filters.sponsorship = !filters.sponsorship"
                >
                  <span
                    class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                    :class="filters.sponsorship ? 'translate-x-6' : 'translate-x-0.5'"
                  />
                </button>
              </div>

              <!-- Closing date -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Closing After</label>
                <input v-model="filters.closing_after" type="date" class="input" />
              </div>
            </div>

            <div class="px-5 pb-6 flex gap-3">
              <button class="btn-secondary flex-1" @click="clearFilters">Clear All</button>
              <button class="btn-primary flex-1" @click="applyFilters">Apply Filters</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { jobsApi } from '@/api'
import { useDebounce } from '@/composables/useDebounce'
import { useNetwork } from '@/composables/useNetwork'
import SkeletonCard from '@/components/SkeletonCard.vue'

interface Job {
  id: number; title: string; organisation: string; location: string
  band?: string; salary_text?: string; status: string; closing_date?: string
  match_score?: number
}

const jobs        = ref<Job[]>([])
const loading     = ref(false)
const search      = ref('')
const page        = ref(1)
const lastPage    = ref(1)
const totalJobs   = ref(0)
const showFilters = ref(false)
const { isOnline } = useNetwork()

const filters = ref({
  contract_type:   '',
  band:            '',
  employment_type: '',
  sponsorship:     false,
  closing_after:   '',
})

const debouncedSearch = useDebounce(search, 400)

const contractTypes = [
  { label: 'All',        value: '' },
  { label: 'Permanent',  value: 'permanent' },
  { label: 'Fixed Term', value: 'fixed_term' },
  { label: 'Bank',       value: 'bank' },
  { label: 'Locum',      value: 'locum' },
]

const bands = ['2', '3', '4', '5', '6', '7', '8a', '8b', '8c', '8d', '9']

const employmentTypes = [
  { label: 'Full Time',  value: 'full_time' },
  { label: 'Part Time',  value: 'part_time' },
  { label: 'Flexible',   value: 'flexible' },
]

const hasActiveFilters = computed(() =>
  Object.entries(filters.value).some(([, v]) => v !== '' && v !== false),
)

async function loadJobs(p = 1) {
  if (!isOnline.value) return
  loading.value = true
  page.value    = p
  try {
    const res = await jobsApi.list({
      page:            p,
      search:          debouncedSearch.value || undefined,
      contract_type:   filters.value.contract_type || undefined,
      band:            filters.value.band || undefined,
      employment_type: filters.value.employment_type || undefined,
      sponsorship:     filters.value.sponsorship || undefined,
      closing_after:   filters.value.closing_after || undefined,
    })
    jobs.value     = res.data.data.data ?? res.data.data
    lastPage.value = res.data.data.last_page ?? 1
    totalJobs.value = res.data.data.total ?? jobs.value.length
  } catch { /* stay silent */ }
  finally { loading.value = false }
}

function applyFilters() { showFilters.value = false; loadJobs(1) }

function clearFilters() {
  filters.value = { contract_type: '', band: '', employment_type: '', sponsorship: false, closing_after: '' }
  showFilters.value = false
  loadJobs(1)
}

const statusBadge = (s: string) => ({
  active:       'badge-green',
  closing_soon: 'badge-amber',
  expired:      'badge-gray',
  removed:      'badge-red',
  updated:      'badge-blue',
}[s] ?? 'badge-gray')

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

// Auto-search as user types (debounced)
watch(debouncedSearch, () => loadJobs(1))

// Load on mount
loadJobs(1)
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from .bg-white, .slide-up-leave-to .bg-white { transform: translateY(100%); }
.slide-up-enter-from, .slide-up-leave-to { background-color: transparent; }
</style>
