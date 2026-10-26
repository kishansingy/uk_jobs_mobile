<template>
  <div class="min-h-screen bg-nhs-blue flex flex-col items-center justify-center px-6">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-10">
        <div class="text-6xl mb-3">🏥</div>
        <h1 class="text-white text-3xl font-bold">UK Medical Jobs</h1>
        <p class="text-blue-200 mt-1">Your NHS career companion</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-3xl shadow-2xl p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="form.email" type="email" class="input" placeholder="you@example.com" autocomplete="username" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input v-model="form.password" type="password" class="input" placeholder="••••••••" autocomplete="current-password" />
        </div>

        <p v-if="error" class="text-nhs-red text-sm text-center">{{ error }}</p>

        <button class="btn-primary mt-2" :disabled="loading" @click="handleLogin">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>

        <p class="text-center text-sm text-gray-500">
          No account?
          <RouterLink to="/register" class="text-nhs-blue font-medium">Register free</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth    = useAuthStore()
const router  = useRouter()
const loading = ref(false)
const error   = ref('')
const form    = ref({ email: '', password: '' })

async function handleLogin() {
  if (!form.value.email || !form.value.password) return
  loading.value = true
  error.value   = ''
  try {
    await auth.login(form.value.email, form.value.password)
    router.push('/')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    error.value = err.response?.data?.message ?? 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
