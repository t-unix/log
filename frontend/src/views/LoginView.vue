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

        <div v-if="!codeSent" class="login-content">
          <h2 class="login-title">Sign in to continue</h2>
          <p class="login-description">
            Enter your email address and we'll send you a verification code
          </p>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <form @submit.prevent="handleRequestCode" class="login-form">
            <div class="form-group">
              <label for="email" class="form-label">Email address</label>
              <input
                id="email"
                v-model="email"
                type="email"
                class="form-input"
                placeholder="you@example.com"
                required
                :disabled="loading"
                autocomplete="email"
              />
            </div>

            <button type="submit" class="login-button" :disabled="loading || !email">
              <span v-if="loading" class="spinner"></span>
              <span v-else>Send verification code</span>
            </button>
          </form>

          <p class="login-footer">
            Passwordless authentication - secure and simple. No password required.
          </p>
        </div>

        <div v-else class="success-content">
          <div class="success-icon">✉️</div>
          <h2 class="success-title">Check your email</h2>
          <p class="success-description">
            We've sent a verification code to <strong>{{ email }}</strong>
          </p>
          <p class="success-hint">
            You can either enter the 6-digit code or click the magic link in the email.
          </p>
          <router-link
            :to="{ name: 'auth-verify', query: { email } }"
            class="login-button verify-button"
          >
            Enter verification code
          </router-link>
          <button
            @click="handleResendCode"
            class="resend-button"
            :disabled="loading"
          >
            {{ loading ? 'Sending...' : 'Resend code' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const codeSent = ref(false)
const loading = ref(false)
const error = ref('')

async function handleRequestCode() {
  if (!email.value) return

  loading.value = true
  error.value = ''

  try {
    await authStore.requestCode(email.value)
    codeSent.value = true
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to send verification code'
    console.error('Request code error:', err)
  } finally {
    loading.value = false
  }
}

async function handleResendCode() {
  codeSent.value = false
  await handleRequestCode()
}

// If already authenticated, redirect to home or intended page
if (authStore.isAuthenticated) {
  const redirect = route.query.redirect as string
  router.push(redirect || '/')
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

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
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
  text-decoration: none;
  display: inline-block;
  text-align: center;
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

/* Success view styles */
.success-content {
  margin-top: 2rem;
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.success-description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.success-hint {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.verify-button {
  display: block;
  margin-bottom: 0.75rem;
}

.resend-button {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--primary-color);
  border-radius: var(--radius-md);
  background: white;
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.resend-button:hover:not(:disabled) {
  background-color: #f9fafb;
}

.resend-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

  .success-icon {
    font-size: 3rem;
  }
}
</style>
