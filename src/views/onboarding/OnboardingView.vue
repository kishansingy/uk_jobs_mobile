<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Progress bar -->
    <div class="h-1 bg-gray-100">
      <div
        class="h-full bg-nhs-blue transition-all duration-500"
        :style="{ width: `${((step) / totalSteps) * 100}%` }"
      />
    </div>

    <!-- Step content -->
    <div class="flex-1 flex flex-col px-6 pt-10 pb-6">
      <!-- Step 1: Profession -->
      <div v-if="step === 1" class="flex-1 flex flex-col">
        <p class="text-xs font-semibold text-nhs-blue uppercase tracking-wide mb-2">Step 1 of {{ totalSteps }}</p>
        <h2 class="text-2xl font-bold text-gray-900 mb-1">What's your profession?</h2>
        <p class="text-gray-500 text-sm mb-6">We'll match you with the most relevant jobs.</p>
        <div v-if="loadingProfessions" class="text-center py-10 text-gray-400">Loading…</div>
        <div v-else class="grid grid-cols-2 gap-3 overflow-y-auto flex-1">
          <button
            v-for="p in professions"
            :key="p.id"
            class="border-2 rounded-2xl p-4 text-left transition-all"
            :class="form.profession_id === p.id
              ? 'border-nhs-blue bg-blue-50'
              : 'border-gray-200 bg-white'"
            @click="form.profession_id = p.id"
          >
            <span class="text-2xl block mb-1">{{ professionIcon(p.name) }}</span>
            <p class="font-semibold text-sm text-gray-900 leading-snug">{{ p.name }}</p>
          </button>
        </div>
      </div>

      <!-- Step 2: Specialty -->
      <div v-else-if="step === 2" class="flex-1 flex flex-col">
        <p class="text-xs font-semibold text-nhs-blue uppercase tracking-wide mb-2">Step 2 of {{ totalSteps }}</p>
        <h2 class="text-2xl font-bold text-gray-900 mb-1">Your specialty</h2>
        <p class="text-gray-500 text-sm mb-6">Optional — helps narrow down job matches.</p>
        <input v-model="specialtySearch" class="input mb-3" placeholder="Search specialties…" />
        <div class="overflow-y-auto flex-1 space-y-2">
          <button
            v-for="s in filteredSpecialties"
            :key="s.id"
            class="w-full border-2 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all"
            :class="form.specialty_id === s.id
              ? 'border-nhs-blue bg-blue-50 text-nhs-blue'
              : 'border-gray-200 bg-white text-gray-800'"
            @click="form.specialty_id = s.id"
          >{{ s.name }}</button>
          <button
            class="w-full border-2 rounded-xl px-4 py-3 text-left text-sm font-medium border-gray-200 text-gray-500"
            @click="form.specialty_id = null; next()"
          >Skip — show all</button>
        </div>
      </div>

      <!-- Step 3: Location preference -->
      <div v-else-if="step === 3" class="flex-1 flex flex-col">
        <p class="text-xs font-semibold text-nhs-blue uppercase tracking-wide mb-2">Step 3 of {{ totalSteps }}</p>
        <h2 class="text-2xl font-bold text-gray-900 mb-1">Where in the UK?</h2>
        <p class="text-gray-500 text-sm mb-6">Select your preferred work location.</p>
        <div class="grid grid-cols-2 gap-3 overflow-y-auto flex-1">
          <button
            v-for="loc in ukRegions"
            :key="loc"
            class="border-2 rounded-2xl p-4 text-sm font-medium transition-all"
            :class="form.uk_location_preference === loc
              ? 'border-nhs-blue bg-blue-50 text-nhs-blue'
              : 'border-gray-200 text-gray-800'"
            @click="form.uk_location_preference = loc"
          >{{ loc }}</button>
        </div>
      </div>

      <!-- Step 4: Sponsorship -->
      <div v-else-if="step === 4" class="flex-1 flex flex-col">
        <p class="text-xs font-semibold text-nhs-blue uppercase tracking-wide mb-2">Step 4 of {{ totalSteps }}</p>
        <h2 class="text-2xl font-bold text-gray-900 mb-1">Do you need sponsorship?</h2>
        <p class="text-gray-500 text-sm mb-8">We'll only show you jobs that match your visa status.</p>
        <div class="space-y-3">
          <button
            class="w-full border-2 rounded-2xl p-5 text-left transition-all"
            :class="form.sponsorship_required === true
              ? 'border-nhs-blue bg-blue-50'
              : 'border-gray-200'"
            @click="form.sponsorship_required = true"
          >
            <p class="font-bold text-gray-900">Yes, I need a visa sponsorship</p>
            <p class="text-sm text-gray-500 mt-0.5">Show me jobs that offer sponsorship</p>
          </button>
          <button
            class="w-full border-2 rounded-2xl p-5 text-left transition-all"
            :class="form.sponsorship_required === false
              ? 'border-nhs-blue bg-blue-50'
              : 'border-gray-200'"
            @click="form.sponsorship_required = false"
          >
            <p class="font-bold text-gray-900">No, I have the right to work in the UK</p>
            <p class="text-sm text-gray-500 mt-0.5">Show me all available jobs</p>
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="px-6 pb-8 safe-bottom flex gap-3">
      <button v-if="step > 1" class="btn-secondary !w-auto px-6" @click="step--">Back</button>
      <button
        class="btn-primary flex-1"
        :disabled="!canProceed || saving"
        @click="step < totalSteps ? next() : finish()"
      >
        {{ saving ? 'Saving…' : step < totalSteps ? 'Continue →' : 'Finish Setup 🎉' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/client'

interface Profession { id: number; name: string }
interface Specialty  { id: number; name: string; profession_id: number }

const router     = useRouter()
const step       = ref(1)
const totalSteps = 4
const saving     = ref(false)

const professions        = ref<Profession[]>([])
const specialties        = ref<Specialty[]>([])
const loadingProfessions = ref(true)
const specialtySearch    = ref('')

const form = ref({
  profession_id:          null as number | null,
  specialty_id:           null as number | null,
  uk_location_preference: '' as string,
  sponsorship_required:   null as boolean | null,
})

const ukRegions = [
  'London', 'South East', 'South West', 'East of England',
  'Midlands', 'North West', 'North East', 'Yorkshire',
  'Wales', 'Scotland', 'Northern Ireland', 'Any / Flexible',
]

const filteredSpecialties = computed(() =>
  specialties.value
    .filter(s => s.profession_id === form.value.profession_id)
    .filter(s => !specialtySearch.value || s.name.toLowerCase().includes(specialtySearch.value.toLowerCase())),
)

const canProceed = computed(() => {
  if (step.value === 1) return !!form.value.profession_id
  if (step.value === 2) return true // specialty optional
  if (step.value === 3) return !!form.value.uk_location_preference
  if (step.value === 4) return form.value.sponsorship_required !== null
  return true
})

function professionIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('nurs'))    return '👩‍⚕️'
  if (n.includes('doctor') || n.includes('physician')) return '👨‍⚕️'
  if (n.includes('physio'))  return '🏃'
  if (n.includes('pharma'))  return '💊'
  if (n.includes('midwif'))  return '👶'
  if (n.includes('denti'))   return '🦷'
  if (n.includes('mental') || n.includes('psych')) return '🧠'
  if (n.includes('radio'))   return '🔬'
  return '🏥'
}

function next() { step.value++ }

async function finish() {
  saving.value = true
  try {
    await api.patch('/profile', {
      profession_id:          form.value.profession_id,
      specialty_id:           form.value.specialty_id,
      uk_location_preference: form.value.uk_location_preference,
      sponsorship_required:   form.value.sponsorship_required,
    })
    router.replace('/')
  } finally { saving.value = false }
}

onMounted(async () => {
  try {
    const [pRes, sRes] = await Promise.all([
      api.get('/profile/professions').catch(() => api.get('/jobs/professions')),
      api.get('/profile/specialties').catch(() => api.get('/jobs/specialties')),
    ])
    professions.value = pRes.data.data ?? []
    specialties.value = sRes.data.data ?? []
  } finally { loadingProfessions.value = false }
})
</script>
