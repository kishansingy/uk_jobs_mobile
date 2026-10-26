<template>
  <div class="min-h-full pb-8">
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="text-white text-2xl" @click="router.back()">←</button>
      <h1 class="text-white text-xl font-bold">Edit Profile</h1>
    </div>

    <div class="px-4 py-5 space-y-5">
      <div class="card space-y-4">
        <p class="font-semibold text-gray-800">Personal Details</p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input v-model="form.name" class="input" placeholder="Dr. Jane Smith" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input v-model="form.phone" type="tel" class="input" placeholder="+44 7700 900000" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
          <textarea v-model="form.professional_summary" class="input h-28 resize-none" placeholder="Brief summary of your experience…" />
        </div>
      </div>

      <div class="card space-y-4">
        <p class="font-semibold text-gray-800">Job Preferences</p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Preferred UK Location</label>
          <select v-model="form.uk_location_preference" class="input">
            <option value="">Any location</option>
            <option v-for="r in ukRegions" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
          <select v-model="form.experience_years" class="input">
            <option value="">Select…</option>
            <option value="0">Less than 1 year</option>
            <option value="1">1–2 years</option>
            <option value="3">3–5 years</option>
            <option value="5">5–10 years</option>
            <option value="10">10+ years</option>
          </select>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-700">Sponsorship Required</p>
            <p class="text-xs text-gray-500">Need a UK work visa?</p>
          </div>
          <button
            class="w-12 h-6 rounded-full transition-colors relative"
            :class="form.sponsorship_required ? 'bg-nhs-blue' : 'bg-gray-300'"
            @click="form.sponsorship_required = !form.sponsorship_required"
          >
            <span
              class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              :class="form.sponsorship_required ? 'translate-x-6' : 'translate-x-0.5'"
            />
          </button>
        </div>
      </div>

      <button class="btn-primary" :disabled="saving" @click="save">
        {{ saving ? 'Saving…' : 'Save Changes' }}
      </button>

      <p v-if="saved" class="text-center text-nhs-green text-sm">✓ Profile updated</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/client'

const router = useRouter()
const saving = ref(false)
const saved  = ref(false)

const form = ref({
  name:                   '',
  phone:                  '',
  professional_summary:   '',
  uk_location_preference: '',
  experience_years:       '',
  sponsorship_required:   false,
})

const ukRegions = [
  'London', 'South East', 'South West', 'East of England',
  'Midlands', 'North West', 'North East', 'Yorkshire',
  'Wales', 'Scotland', 'Northern Ireland', 'Any / Flexible',
]

async function save() {
  saving.value = true
  saved.value  = false
  try {
    await api.patch('/profile', {
      professional_summary:   form.value.professional_summary,
      uk_location_preference: form.value.uk_location_preference,
      experience_years:       form.value.experience_years || undefined,
      sponsorship_required:   form.value.sponsorship_required,
    })
    saved.value = true
    setTimeout(() => router.back(), 1000)
  } finally { saving.value = false }
}

onMounted(async () => {
  try {
    const res = await api.get('/profile')
    const p   = res.data.data
    form.value.name                   = p.user?.name ?? ''
    form.value.phone                  = p.user?.phone ?? ''
    form.value.professional_summary   = p.professional_summary ?? ''
    form.value.uk_location_preference = p.uk_location_preference ?? ''
    form.value.experience_years       = p.experience_years?.toString() ?? ''
    form.value.sponsorship_required   = p.sponsorship_required ?? false
  } catch { /* prefill fails silently */ }
})
</script>
