<template>
  <div class="min-h-full pb-8">
    <!-- Header -->
    <div class="bg-nhs-blue safe-top px-4 pt-12 pb-8">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
          {{ initials }}
        </div>
        <div>
          <p class="text-white font-bold text-lg">{{ auth.user?.name }}</p>
          <p class="text-blue-200 text-sm">{{ auth.user?.email }}</p>
          <span class="mt-1 inline-block badge bg-white/20 text-white text-xs capitalize">{{ sub.planSlug }} Plan</span>
        </div>
      </div>
    </div>

    <div class="px-4 py-5 space-y-3 -mt-2">
      <!-- Menu items -->
      <div class="card !p-0 overflow-hidden divide-y divide-gray-100">
        <button
          v-for="item in menuItems"
          :key="item.label"
          class="w-full flex items-center gap-4 px-4 py-4 text-left active:bg-gray-50"
          @click="item.action()"
        >
          <span class="text-xl w-8 text-center">{{ item.icon }}</span>
          <span class="flex-1 text-sm font-medium text-gray-800">{{ item.label }}</span>
          <span class="text-gray-300">›</span>
        </button>
      </div>

      <!-- Upgrade CTA — only show for free/pro users -->
      <div v-if="!sub.isPremium" class="card bg-gradient-to-r from-nhs-blue to-nhs-blue-light text-white">
        <p class="font-bold text-base">{{ sub.isFree ? 'Upgrade to Pro' : 'Upgrade to Premium' }}</p>
        <p class="text-blue-100 text-sm mt-1 mb-4">
          {{ sub.isFree
            ? 'Unlock AI CV analysis, unlimited alerts and more from £9.99/mo'
            : 'Add 1-to-1 career advisor sessions from £24.99/mo' }}
        </p>
        <RouterLink to="/plans" class="inline-block bg-white text-nhs-blue font-semibold text-sm px-5 py-2.5 rounded-xl">
          View Plans
        </RouterLink>
      </div>

      <!-- Logout -->
      <button class="w-full text-center text-nhs-red font-medium text-sm py-3" @click="handleLogout">
        Sign out
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'

const auth   = useAuthStore()
const sub    = useSubscriptionStore()
const router = useRouter()

const initials = computed(() =>
  auth.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'UK',
)

const menuItems = [
  { icon: '👤', label: 'Edit Profile',           action: () => router.push('/profile/edit') },
  { icon: '🎓', label: 'Qualifications',          action: () => router.push('/profile/qualifications') },
  { icon: '🔔', label: 'Notification Settings',  action: () => router.push('/profile/notifications') },
  { icon: '📋', label: 'My Applications',        action: () => router.push('/applications') },
  { icon: '💎', label: 'Subscription & Billing', action: () => router.push('/plans') },
]

function handleLogout() {
  auth.logout()
  router.push('/login')
}

onMounted(() => sub.fetchCurrent().catch(() => {}))
</script>
