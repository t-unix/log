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

  const isAuthenticated = computed(() => !!token.value)

  // Set authorization header if token exists on store initialization
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  async function checkAuth() {
    if (!token.value) return false

    try {
      const response = await axios.get('/api/auth/me')
      user.value = response.data
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  async function requestCode(email: string) {
    const response = await axios.post('/api/auth/request-code', { email })
    return response.data
  }

  async function verifyCode(email: string, code: string) {
    const response = await axios.post('/api/auth/verify-code', { email, code })
    const { token: authToken, user: userData } = response.data
    setAuth(authToken, userData)
  }

  async function verifyMagicLink(tokenParam: string) {
    const response = await axios.get(`/api/auth/verify-link?token=${tokenParam}`)
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
    requestCode,
    verifyCode,
    verifyMagicLink,
    setAuth,
    logout
  }
})
