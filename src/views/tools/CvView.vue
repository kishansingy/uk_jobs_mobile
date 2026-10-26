<template>
  <div class="min-h-full pb-8">
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="text-white text-2xl" @click="router.back()">←</button>
      <h1 class="text-white text-xl font-bold">CV Analysis</h1>
    </div>

    <div class="px-4 py-5 space-y-4">
      <!-- Upload is free for everyone -->
      <div class="card space-y-3">
        <p class="font-semibold text-gray-800">Upload your CV</p>
        <p class="text-sm text-gray-500">PDF or Word format, max 10MB</p>
        <label class="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-nhs-blue transition-colors">
          <span class="text-3xl block mb-2">📄</span>
          <span class="text-sm text-gray-600">Tap to select file</span>
          <input type="file" accept=".pdf,.doc,.docx" class="hidden" @change="handleFile" />
        </label>
        <div v-if="selectedFile" class="flex items-center gap-2 text-sm text-nhs-green">
          <span>✓</span> {{ selectedFile.name }}
        </div>
        <button class="btn-primary" :disabled="!selectedFile || uploading" @click="uploadCv">
          {{ uploading ? 'Uploading…' : 'Upload CV' }}
        </button>
      </div>

      <!-- AI Analysis — Pro gate -->
      <PaywallGate feature="cv_analysis" title="AI CV Analysis" message="Upgrade to Pro to get AI-powered feedback on your CV including keyword matching, formatting tips, and NHS scoring.">
        <div class="card space-y-3">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🤖</span>
            <div>
              <p class="font-semibold text-gray-900">AI Analysis</p>
              <p class="text-sm text-gray-500">Instant feedback on your CV</p>
            </div>
          </div>

          <div v-if="analyses.length === 0" class="text-sm text-gray-500">
            Upload a CV above, then run an AI analysis to get feedback.
          </div>

          <div v-for="analysis in analyses" :key="analysis.id" class="border border-gray-100 rounded-xl p-4 space-y-2">
            <div class="flex justify-between items-center">
              <p class="font-medium text-gray-800 text-sm">Analysis #{{ analysis.id }}</p>
              <span class="badge-green text-xs">Score: {{ analysis.score ?? '—' }}</span>
            </div>
            <p class="text-sm text-gray-600">{{ analysis.summary }}</p>
          </div>

          <button class="btn-primary" :disabled="!hasUploadedCv" @click="runAnalysis">
            Run AI Analysis
          </button>
        </div>
      </PaywallGate>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/client'
import PaywallGate from '@/components/PaywallGate.vue'

interface Analysis { id: number; summary: string; score?: number }

const router       = useRouter()
const selectedFile = ref<File | null>(null)
const uploading    = ref(false)
const hasUploadedCv = ref(false)
const analyses     = ref<Analysis[]>([])
let uploadedDocId  = 0

function handleFile(e: Event) {
  const target = e.target as HTMLInputElement
  selectedFile.value = target.files?.[0] ?? null
}

async function uploadCv() {
  if (!selectedFile.value) return
  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', selectedFile.value)
    const res           = await api.post('/cv', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    uploadedDocId       = res.data.data.id
    hasUploadedCv.value = true
    selectedFile.value  = null
  } finally { uploading.value = false }
}

async function runAnalysis() {
  if (!uploadedDocId) return
  await api.post(`/cv/${uploadedDocId}/analyse`)
  const res      = await api.get(`/cv/${uploadedDocId}/analyses`)
  analyses.value = res.data.data
}

onMounted(async () => {
  try {
    const res = await api.get('/cv')
    if (res.data.data?.length) {
      hasUploadedCv.value = true
      uploadedDocId       = res.data.data[0].id
    }
  } catch { /* not uploaded yet */ }
})
</script>
