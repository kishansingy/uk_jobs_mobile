<template>
  <div class="min-h-screen bg-nhs-blue flex flex-col justify-center px-6 py-10">
    <div class="w-full max-w-sm mx-auto">
      <div class="text-center mb-8">
        <div class="text-5xl mb-2">🏥</div>
        <h1 class="text-white text-2xl font-bold">Create your account</h1>
        <p class="text-blue-200 text-sm mt-1">Free to join — upgrade anytime</p>
      </div>

      <div class="bg-white rounded-3xl shadow-2xl p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input v-model="form.name" type="text" class="input" placeholder="Dr. Jane Smith" autocomplete="name" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="form.email" type="email" class="input" placeholder="you@example.com" autocomplete="email" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
          <input v-model="form.phone" type="tel" class="input" placeholder="+44 7700 900000" autocomplete="tel" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <select v-model="form.country" class="input">
            <option value="">Select country</option>
            <option value="GB">United Kingdom</option>
            <option value="IE">Ireland</option>
            <option value="NG">Nigeria</option>
            <option value="IN">India</option>
            <option value="PH">Philippines</option>
            <option value="ZA">South Africa</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input v-model="form.password" type="password" class="input" placeholder="Min. 8 characters" autocomplete="new-password" />
        </div>

        <p v-if="error" class="text-nhs-red text-sm text-center">{{ error }}</p>

        <button class="btn-primary mt-2" :disabled="loading" @click="handleRegister">
          {{ loading ? 'Creating account…' : 'Create free account' }}
        </button>

        <p class="text-center text-sm text-gray-500">
          Already registered?
          <RouterLink to="/login" class="text-nhs-blue font-medium">Sign in</RouterLink>
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
const form    = ref({ name: '', email: '', password: '', phone: '', country: '' })

async function handleRegister() {
  if (!form.value.name || !form.value.email || !form.value.password) {
    error.value = 'Please fill in all required fields.'
    return
  }
  loading.value = true
  error.value   = ''
  try {
    await auth.register({
      name:     form.value.name,
      email:    form.value.email,
      password: form.value.password,
      phone:    form.value.phone || undefined,
      country:  form.value.country || undefined,
    })
    router.push('/')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    error.value = err.response?.data?.message ?? 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
