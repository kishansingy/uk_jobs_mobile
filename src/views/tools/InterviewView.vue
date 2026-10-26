<template>
  <div class="min-h-full pb-8">
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="text-white text-2xl" @click="router.back()">←</button>
      <h1 class="text-white text-xl font-bold">Interview Prep</h1>
    </div>

    <div class="px-4 py-5 space-y-4">
      <!-- Free: basic categories always visible -->
      <div class="card">
        <p class="text-sm text-gray-500 mb-3">Select a category to practise</p>
        <div v-if="loading" class="text-center py-6 text-gray-400">Loading…</div>
        <div v-else class="space-y-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-left active:bg-gray-50"
            @click="selectCategory(cat)"
          >
            <span class="text-xl">🎤</span>
            <span class="font-medium text-gray-800">{{ cat.name }}</span>
            <span class="ml-auto text-gray-300">›</span>
          </button>
        </div>
      </div>

      <!-- AI Feedback — Pro locked -->
      <PaywallGate feature="interview_prep" title="Full Interview Prep" message="Upgrade to Pro for AI feedback, mock sessions and full question banks.">
        <div class="card bg-blue-50 border border-blue-100">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">🤖</span>
            <p class="font-semibold text-gray-900">AI Feedback</p>
          </div>
          <p class="text-sm text-gray-600">Record your answers and get instant AI-powered feedback with tips to improve.</p>
          <button class="btn-primary mt-4" disabled>Start AI Session</button>
        </div>
      </PaywallGate>
    </div>

    <!-- Questions sheet -->
    <Teleport to="body">
      <div v-if="activeCategory" class="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
        <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
          <button class="text-white text-2xl" @click="activeCategory = null">←</button>
          <h2 class="text-white text-lg font-bold">{{ activeCategory.name }}</h2>
        </div>
        <div class="px-4 py-5 space-y-3">
          <div v-if="qLoading" class="text-center py-10 text-gray-400">Loading questions…</div>
          <div
            v-for="(q, i) in questions"
            :key="q.id"
            class="card"
          >
            <p class="text-xs text-gray-400 mb-1">Question {{ i + 1 }}</p>
            <p class="font-medium text-gray-900 leading-snug">{{ q.text }}</p>
            <p v-if="q.hint" class="text-sm text-gray-500 mt-2 italic">💡 {{ q.hint }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { interviewApi } from '@/api'
import PaywallGate from '@/components/PaywallGate.vue'

interface Category { id: number; name: string }
interface Question  { id: number; text: string; hint?: string }

const router         = useRouter()
const categories     = ref<Category[]>([])
const questions      = ref<Question[]>([])
const loading        = ref(true)
const qLoading       = ref(false)
const activeCategory = ref<Category | null>(null)

async function selectCategory(cat: Category) {
  activeCategory.value = cat
  qLoading.value       = true
  try {
    const res    = await interviewApi.questions({ category_id: cat.id })
    questions.value = res.data.data
  } finally { qLoading.value = false }
}

onMounted(async () => {
  try {
    const res        = await interviewApi.categories()
    categories.value = res.data.data
  } finally { loading.value = false }
})
</script>
