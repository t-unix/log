<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card card">
        <div class="login-header">
          <h1 class="login-logo">
            <span class="logo-icon">📦</span>
            Log
          </h1>
          <p class="login-subtitle">Asset Management for Organizations</p>
        </div>

        <div class="login-content">
          <h2 class="login-title">Sign in to continue</h2>
          <p class="login-description">
            Enter your credentials to access your organization's assets.
          </p>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <form @submit.prevent="handlePasswordLogin" class="login-form">
            <div class="form-group">
              <label for="username" class="form-label">Username or Email</label>
              <input
                id="username"
                v-model="username"
                type="text"
                class="form-input"
                placeholder="Enter your username or email"
                required
                autocomplete="username"
              />
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                v-model="password"
                type="password"
                class="form-input"
                placeholder="Enter your password"
                required
                autocomplete="current-password"
              />
            </div>

            <button type="submit" class="login-button" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              <span v-else>Sign In</span>
            </button>
          </form>

          <p class="login-footer">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const error = ref<string | null>(null)
const loading = ref(false)
const username = ref('')
const password = ref('')

onMounted(() => {
  // Check for OAuth errors in query params
  const errorParam = route.query.error as string
  if (errorParam) {
    switch (errorParam) {
      case 'github_not_configured':
        error.value = 'GitHub authentication is not configured.'
        break
      case 'google_not_configured':
        error.value = 'Google authentication is not configured.'
        break
      case 'apple_not_implemented':
        error.value = 'Apple authentication is not yet implemented.'
        break
      case 'auth_failed':
        error.value = 'Authentication failed. Please try again.'
        break
      default:
        error.value = 'An error occurred during authentication.'
    }
  }

  // Check for token in query params (OAuth callback)
  const token = route.query.token as string
  if (token) {
    const userData = {
      id: '',
      email: '',
      name: '',
      role: '',
      organizationId: ''
    }
    authStore.setAuth(token, userData)
    authStore.checkAuth().then(() => {
      router.push('/')
    })
  }
})

async function handlePasswordLogin() {
  loading.value = true
  error.value = null

  try {
    await authStore.loginWithPassword(username.value, password.value)
    router.push('/')
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.response?.data?.error || 'Login failed. Please check your credentials and try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 28rem;
}

.login-card {
  padding: 2.5rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.login-logo .logo-icon {
  font-size: 3rem;
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.login-content {
  margin-top: 2rem;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-align: center;
}

.login-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  padding: 0.875rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9375rem;
  transition: var(--transition);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: var(--text-light);
}

.login-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 0.5rem;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-light);
  line-height: 1.5;
}

.error-message {
  padding: 1rem;
  background-color: #FEE2E2;
  color: #DC2626;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  .login-logo {
    font-size: 2rem;
  }

  .login-title {
    font-size: 1.25rem;
  }
}
</style>
