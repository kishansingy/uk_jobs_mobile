<template>
  <div class="min-h-full pb-8">
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="text-white text-2xl" @click="router.back()">←</button>
      <h1 class="text-white text-xl font-bold">Supporting Statements</h1>
    </div>

    <div class="px-4 py-5 space-y-4">
      <PaywallGate feature="supporting_statement" title="AI Supporting Statements" message="Upgrade to Pro to generate tailored NHS supporting statements powered by AI.">
        <!-- Generate form -->
        <div class="card space-y-4">
          <p class="font-semibold text-gray-800">Generate a Statement</p>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input v-model="form.job_title" class="input" placeholder="e.g. Band 6 Staff Nurse" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
            <input v-model="form.organisation" class="input" placeholder="e.g. Royal London Hospital" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Key requirements (one per line)</label>
            <textarea v-model="form.requirements" class="input h-24 resize-none" placeholder="Communication skills&#10;Patient care&#10;Team leadership" />
          </div>

          <button class="btn-primary" :disabled="generating" @click="generate">
            {{ generating ? 'Generating…' : '✨ Generate Statement' }}
          </button>
        </div>

        <!-- Saved statements -->
        <div v-if="statements.length" class="space-y-3">
          <p class="font-semibold text-gray-800">Saved Statements</p>
          <div
            v-for="s in statements"
            :key="s.id"
            class="card space-y-2 cursor-pointer active:scale-98 transition-transform"
            @click="viewing = s"
          >
            <div class="flex justify-between items-start">
              <p class="font-medium text-gray-900 text-sm">{{ s.job_title }}</p>
              <span class="text-xs text-gray-400">{{ formatDate(s.created_at) }}</span>
            </div>
            <p class="text-sm text-gray-600 line-clamp-2">{{ s.content }}</p>
          </div>
        </div>
      </PaywallGate>
    </div>

    <!-- View full statement sheet -->
    <Teleport to="body">
      <div v-if="viewing" class="fixed inset-0 z-50 bg-white overflow-y-auto">
        <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
          <button class="text-white text-2xl" @click="viewing = null">←</button>
          <h2 class="text-white font-bold truncate flex-1">{{ viewing.job_title }}</h2>
        </div>
        <div class="px-4 py-5">
          <p class="text-gray-800 leading-relaxed whitespace-pre-line">{{ viewing.content }}</p>
          <button class="btn-secondary mt-6" @click="copyContent(viewing.content)">📋 Copy to clipboard</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/client'
import PaywallGate from '@/components/PaywallGate.vue'

interface Statement { id: number; job_title: string; content: string; created_at: string }

const router     = useRouter()
const statements = ref<Statement[]>([])
const generating = ref(false)
const viewing    = ref<Statement | null>(null)
const form       = ref({ job_title: '', organisation: '', requirements: '' })

async function generate() {
  if (!form.value.job_title) return
  generating.value = true
  try {
    await api.post('/supporting-statements/generate', {
      job_title:    form.value.job_title,
      organisation: form.value.organisation,
      requirements: form.value.requirements.split('\n').filter(Boolean),
    })
    await loadStatements()
    form.value = { job_title: '', organisation: '', requirements: '' }
  } finally { generating.value = false }
}

async function loadStatements() {
  const res        = await api.get('/supporting-statements')
  statements.value = res.data.data
}

async function copyContent(text: string) {
  await navigator.clipboard.writeText(text).catch(() => {})
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

onMounted(() => loadStatements().catch(() => {}))
</script>
