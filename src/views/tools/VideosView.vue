<template>
  <div class="min-h-full pb-8">
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="text-white text-2xl" @click="router.back()">←</button>
      <h1 class="text-white text-xl font-bold">Video Library</h1>
    </div>

    <!-- Category filter -->
    <div class="flex gap-2 px-4 py-3 overflow-x-auto">
      <button
        class="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
        :class="!activeCategory ? 'bg-nhs-blue text-white border-nhs-blue' : 'bg-white text-gray-600 border-gray-200'"
        @click="activeCategory = null"
      >All</button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
        :class="activeCategory === cat.id ? 'bg-nhs-blue text-white border-nhs-blue' : 'bg-white text-gray-600 border-gray-200'"
        @click="activeCategory = cat.id"
      >{{ cat.name }}</button>
    </div>

    <div class="px-4 space-y-3">
      <div v-if="loading" class="text-center py-16 text-gray-400">Loading videos…</div>
      <template v-else>
        <div v-for="video in filtered" :key="video.id">
          <!-- Free videos render normally; premium videos use PaywallGate -->
          <PaywallGate v-if="video.is_premium" feature="video_library" title="Pro Videos" message="Upgrade to Pro to watch all career guidance videos.">
            <VideoCard :video="video" />
          </PaywallGate>
          <VideoCard v-else :video="video" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { videosApi } from '@/api'
import PaywallGate from '@/components/PaywallGate.vue'
import VideoCard from '@/components/VideoCard.vue'

interface Category { id: number; name: string }
interface Video { id: number; title: string; thumbnail_url?: string; duration_seconds?: number; is_premium: boolean; category?: Category }

const router         = useRouter()
const videos         = ref<Video[]>([])
const categories     = ref<Category[]>([])
const loading        = ref(true)
const activeCategory = ref<number | null>(null)

const filtered = computed(() =>
  activeCategory.value
    ? videos.value.filter(v => v.category?.id === activeCategory.value)
    : videos.value,
)

onMounted(async () => {
  try {
    const [vRes, cRes] = await Promise.all([videosApi.list(), videosApi.categories()])
    videos.value     = vRes.data.data
    categories.value = cRes.data.data
  } finally { loading.value = false }
})
</script>
