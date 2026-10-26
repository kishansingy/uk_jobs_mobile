<template>
  <slot v-if="!error" />
  <div v-else class="flex-1 flex flex-col items-center justify-center px-6 text-center py-20 space-y-4">
    <p class="text-5xl">⚠️</p>
    <p class="font-bold text-gray-900 text-lg">Something went wrong</p>
    <p class="text-sm text-gray-500">{{ message }}</p>
    <button class="btn-primary !w-auto px-8" @click="reset">Try Again</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

withDefaults(defineProps<{ message?: string }>(), {
  message: 'An unexpected error occurred.',
})

const error = ref(false)

onErrorCaptured(() => {
  error.value = true
  return false
})

function reset() { error.value = false }
</script>
