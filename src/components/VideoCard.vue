<template>
  <div class="card !p-0 overflow-hidden flex gap-3">
    <div class="w-28 h-20 bg-gray-900 flex-shrink-0 flex items-center justify-center relative">
      <img v-if="video.thumbnail_url" :src="video.thumbnail_url" :alt="video.title" class="w-full h-full object-cover" />
      <span v-else class="text-3xl">🎬</span>
      <span v-if="video.is_premium" class="absolute top-1 left-1 badge bg-amber-400 text-amber-900 text-xs">PRO</span>
    </div>
    <div class="flex-1 py-3 pr-3 min-w-0">
      <p class="font-semibold text-sm text-gray-900 leading-snug line-clamp-2">{{ video.title }}</p>
      <p v-if="video.duration_seconds" class="text-xs text-gray-400 mt-1">{{ formatDuration(video.duration_seconds) }}</p>
      <p v-if="video.category" class="badge-blue text-xs mt-1.5 self-start inline-flex">{{ video.category.name }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface VideoProps {
  video: {
    title: string
    thumbnail_url?: string
    duration_seconds?: number
    is_premium: boolean
    category?: { id: number; name: string }
  }
}
defineProps<VideoProps>()

const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
</script>
