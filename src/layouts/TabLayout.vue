<template>
  <div class="flex flex-col h-full">
    <!-- Offline banner -->
    <div v-if="!isOnline" class="bg-amber-500 text-white text-xs text-center py-2 font-medium flex-shrink-0">
      ⚠️ No internet connection
    </div>

    <!-- Page content -->
    <div class="flex-1 overflow-y-auto overscroll-none">
      <RouterView />
    </div>

    <!-- Tab bar -->
    <nav
      class="flex-shrink-0 bg-white border-t border-gray-200 safe-bottom"
      style="padding-bottom: max(env(safe-area-inset-bottom), 8px)"
    >
      <div class="flex">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="tab.to"
          class="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors"
          :class="isActive(tab.to)
            ? 'text-nhs-blue'
            : 'text-gray-400 active:text-gray-600'"
        >
          <span class="text-xl">{{ tab.icon }}</span>
          <span class="font-medium">{{ tab.label }}</span>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useNetwork } from '@/composables/useNetwork'

const route = useRoute()
const { isOnline } = useNetwork()

const tabs = [
  { name: 'home',    label: 'Home',    icon: '🏠', to: '/'       },
  { name: 'jobs',    label: 'Jobs',    icon: '💼', to: '/jobs'   },
  { name: 'saved',   label: 'Saved',   icon: '🔖', to: '/saved'  },
  { name: 'tools',   label: 'Tools',   icon: '🛠', to: '/tools'  },
  { name: 'profile', label: 'Profile', icon: '👤', to: '/profile'},
]

const isActive = (to: string) =>
  to === '/' ? route.path === '/' : route.path.startsWith(to)
</script>
