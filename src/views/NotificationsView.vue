<template>
  <div class="min-h-full pb-8">
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="text-white text-2xl" @click="router.back()">←</button>
        <h1 class="text-white text-xl font-bold">Notifications</h1>
      </div>
      <button
        v-if="unreadCount > 0"
        class="text-blue-200 text-sm hover:text-white"
        @click="markAll"
      >Mark all read</button>
    </div>

    <div class="px-4 py-4 space-y-2">
      <div v-if="loading" class="space-y-3">
        <SkeletonCard v-for="i in 5" :key="i" />
      </div>

      <div v-else-if="notifications.length === 0" class="text-center py-20">
        <p class="text-4xl mb-3">🔔</p>
        <p class="font-medium text-gray-600">No notifications yet</p>
        <p class="text-sm text-gray-400 mt-1">We'll notify you about job alerts and updates</p>
      </div>

      <div
        v-for="n in notifications"
        :key="n.id"
        class="card flex gap-3 cursor-pointer active:scale-98 transition-transform"
        :class="!n.read_at ? 'border-l-4 border-l-nhs-blue' : ''"
        @click="markRead(n)"
      >
        <span class="text-2xl flex-shrink-0 mt-0.5">{{ notificationIcon(n.type) }}</span>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm text-gray-900">{{ n.title }}</p>
          <p class="text-sm text-gray-600 mt-0.5 leading-snug">{{ n.body }}</p>
          <p class="text-xs text-gray-400 mt-1.5">{{ timeAgo(n.created_at) }}</p>
        </div>
        <div v-if="!n.read_at" class="w-2.5 h-2.5 rounded-full bg-nhs-blue flex-shrink-0 mt-1.5" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { notificationsApi } from '@/api'
import SkeletonCard from '@/components/SkeletonCard.vue'

interface Notification {
  id: number
  type: string
  title: string
  body: string
  read_at: string | null
  created_at: string
}

const router        = useRouter()
const notifications = ref<Notification[]>([])
const loading       = ref(true)

const unreadCount = computed(() => notifications.value.filter(n => !n.read_at).length)

function notificationIcon(type: string): string {
  if (type.includes('job_alert'))    return '💼'
  if (type.includes('application'))  return '📋'
  if (type.includes('interview'))    return '🎤'
  if (type.includes('subscription')) return '💎'
  if (type.includes('advisor'))      return '👩‍⚕️'
  return '🔔'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)   return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)    return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)    return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

async function markRead(n: Notification) {
  if (n.read_at) return
  try {
    await notificationsApi.markRead(n.id)
    n.read_at = new Date().toISOString()
  } catch { /* non-fatal */ }
}

async function markAll() {
  try {
    await notificationsApi.markAllRead()
    notifications.value.forEach(n => { n.read_at = new Date().toISOString() })
  } catch { /* ignore */ }
}

onMounted(async () => {
  try {
    const res           = await notificationsApi.list()
    notifications.value = res.data.data
  } finally { loading.value = false }
})
</script>
