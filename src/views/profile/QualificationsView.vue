<template>
  <div class="min-h-full pb-8">
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="text-white text-2xl" @click="router.back()">←</button>
      <h1 class="text-white text-xl font-bold">Qualifications</h1>
    </div>

    <div class="px-4 py-5 space-y-4">
      <!-- Add form -->
      <div class="card space-y-4">
        <p class="font-semibold text-gray-800">Add Qualification</p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Qualification Name</label>
          <input v-model="form.name" class="input" placeholder="e.g. RGN, MBBS, BSc Nursing" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Institution</label>
            <input v-model="form.institution" class="input" placeholder="University name" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input v-model="form.year" type="number" class="input" placeholder="2020" min="1970" :max="new Date().getFullYear()" />
          </div>
        </div>
        <button class="btn-primary" :disabled="!form.name || adding" @click="addQualification">
          {{ adding ? 'Adding…' : '+ Add' }}
        </button>
      </div>

      <!-- List -->
      <div v-if="loading" class="text-center py-8 text-gray-400">Loading…</div>
      <div v-else-if="qualifications.length === 0" class="text-center py-8 text-gray-400">
        No qualifications added yet.
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="q in qualifications"
          :key="q.id"
          class="card flex items-center gap-3"
        >
          <span class="text-2xl">🎓</span>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 text-sm">{{ q.name }}</p>
            <p class="text-xs text-gray-500">{{ q.institution }} <span v-if="q.year">· {{ q.year }}</span></p>
          </div>
          <button class="text-nhs-red text-sm flex-shrink-0" @click="removeQualification(q.id)">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/client'

interface Qualification { id: number; name: string; institution?: string; year?: number }

const router         = useRouter()
const qualifications = ref<Qualification[]>([])
const loading        = ref(true)
const adding         = ref(false)
const form           = ref({ name: '', institution: '', year: '' })

async function loadQualifications() {
  loading.value = true
  try {
    const res            = await api.get('/profile')
    qualifications.value = res.data.data.qualifications ?? []
  } finally { loading.value = false }
}

async function addQualification() {
  adding.value = true
  try {
    await api.post('/profile/qualifications', {
      name:        form.value.name,
      institution: form.value.institution || undefined,
      year:        form.value.year ? Number(form.value.year) : undefined,
    })
    form.value = { name: '', institution: '', year: '' }
    await loadQualifications()
  } finally { adding.value = false }
}

async function removeQualification(id: number) {
  await api.delete(`/profile/qualifications/${id}`)
  qualifications.value = qualifications.value.filter(q => q.id !== id)
}

onMounted(() => loadQualifications())
</script>
