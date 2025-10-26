<template>
  <div class="verify-view">
    <div class="verify-container">
      <div class="verify-card card">
        <div class="verify-header">
          <h1 class="verify-logo">
            <span class="logo-icon">=æ</span>
            Log
          </h1>
          <p class="verify-subtitle">Asset Management for Organizations</p>
        </div>

        <div v-if="verifyingMagicLink" class="verifying-content">
          <div class="spinner-large"></div>
          <h2 class="verifying-title">Verifying your magic link...</h2>
          <p class="verifying-description">Please wait while we log you in</p>
        </div>

        <div v-else class="verify-content">
          <h2 class="verify-title">Enter verification code</h2>
          <p class="verify-description">
            We sent a 6-digit code to <strong>{{ email }}</strong>
          </p>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <form @submit.prevent="handleVerifyCode" class="verify-form">
            <div class="form-group">
              <label for="code" class="form-label">Verification code</label>
              <input
                id="code"
                v-model="code"
                type="text"
                class="form-input code-input"
                placeholder="000000"
                required
                maxlength="6"
                pattern="[0-9]{6}"
                :disabled="loading"
                autocomplete="one-time-code"
                @input="formatCode"
              />
              <p class="input-hint">Enter the 6-digit code from your email</p>
            </div>

            <button type="submit" class="verify-button" :disabled="loading || code.length !== 6">
              <span v-if="loading" class="spinner"></span>
              <span v-else>Verify and sign in</span>
            </button>
          </form>

          <div class="verify-footer">
            <p class="footer-text">
              Didn't receive the code?
              <router-link to="/login" class="footer-link">Request a new one</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref(route.query.email as string || '')
const code = ref('')
const loading = ref(false)
const verifyingMagicLink = ref(false)
const error = ref('')

onMounted(async () => {
  // Check if this is a magic link (has token in query)
  const token = route.query.token as string
  if (token) {
    verifyingMagicLink.value = true
    try {
      await authStore.verifyMagicLink(token)
      // Redirect to home or intended page
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } catch (err: any) {
      verifyingMagicLink.value = false
      error.value = err.response?.data?.error || 'Invalid or expired magic link'
      console.error('Magic link verification error:', err)
    }
  } else if (!email.value) {
    // No email provided, redirect to login
    router.push('/login')
  }
})

function formatCode(event: Event) {
  const input = event.target as HTMLInputElement
  // Only allow numbers
  code.value = input.value.replace(/[^0-9]/g, '')
}

async function handleVerifyCode() {
  if (!email.value || code.value.length !== 6) return

  loading.value = true
  error.value = ''

  try {
    await authStore.verifyCode(email.value, code.value)
    // Redirect to home or intended page
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Invalid or expired code'
    console.error('Code verification error:', err)
    code.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.verify-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.verify-container {
  width: 100%;
  max-width: 28rem;
}

.verify-card {
  padding: 2.5rem;
}

.verify-header {
  text-align: center;
  margin-bottom: 2rem;
}

.verify-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.verify-logo .logo-icon {
  font-size: 3rem;
}

.verify-subtitle {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.verify-content {
  margin-top: 2rem;
}

.verify-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-align: center;
}

.verify-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.verify-form {
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

.code-input {
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.5rem;
  font-family: 'Courier New', monospace;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.input-hint {
  font-size: 0.75rem;
  color: var(--text-light);
  margin: 0;
}

.verify-button {
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

.verify-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.verify-button:active:not(:disabled) {
  transform: translateY(0);
}

.verify-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.verify-footer {
  margin-top: 2rem;
  text-align: center;
}

.footer-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.footer-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.footer-link:hover {
  text-decoration: underline;
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

/* Verifying magic link styles */
.verifying-content {
  margin-top: 2rem;
  text-align: center;
  padding: 2rem 0;
}

.spinner-large {
  display: inline-block;
  width: 3rem;
  height: 3rem;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 0.8s linear infinite;
  margin-bottom: 1.5rem;
}

.verifying-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.verifying-description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .verify-card {
    padding: 2rem 1.5rem;
  }

  .verify-logo {
    font-size: 2rem;
  }

  .verify-title {
    font-size: 1.25rem;
  }

  .code-input {
    font-size: 1.25rem;
  }
}
</style>
