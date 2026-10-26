import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'

export interface MobileUser {
  id: number
  name: string
  email: string
  phone?: string
  country?: string
  active: boolean
  onboarding_completed: boolean
  roles: string[]
}

export const useAuthStore = defineStore('auth', () => {
  const user  = ref<MobileUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isLoggedIn  = computed(() => !!token.value && !!user.value)
  const isPremium   = computed(() => user.value?.roles?.includes('premium') ?? false)

  async function login(email: string, password: string) {
    const res   = await authApi.login(email, password)
    token.value = res.data.data.token
    user.value  = res.data.data.user
    localStorage.setItem('token', token.value!)
  }

  async function register(data: { name: string; email: string; password: string; phone?: string; country?: string }) {
    const res   = await authApi.register(data)
    token.value = res.data.data.token
    user.value  = res.data.data.user
    localStorage.setItem('token', token.value!)
  }

  async function fetchMe() {
    try {
      const res  = await authApi.me()
      user.value = res.data.data
    } catch { logout() }
  }

  function logout() {
    authApi.logout().catch(() => {})
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
  }

  return { user, token, isLoggedIn, isPremium, login, register, fetchMe, logout }
})
