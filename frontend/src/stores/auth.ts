import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: string
  organizationId: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function checkAuth() {
    if (!token.value) return

    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      user.value = response.data
    } catch (error) {
      logout()
    }
  }

  async function login(provider: string) {
    window.location.href = `/api/auth/${provider}`
  }

  async function loginWithPassword(username: string, password: string) {
    const response = await axios.post('/api/auth/login', {
      username,
      password
    })
    const { token: authToken, user: userData } = response.data
    setAuth(authToken, userData)
  }

  function setAuth(authToken: string, userData: User) {
    token.value = authToken
    user.value = userData
    localStorage.setItem('token', authToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  return {
    user,
    token,
    isAuthenticated,
    checkAuth,
    login,
    loginWithPassword,
    setAuth,
    logout
  }
})
