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
            Choose your preferred authentication provider to access your organization's assets.
          </p>

          <div class="oauth-buttons">
            <button @click="handleLogin('github')" class="oauth-button oauth-github">
              <svg class="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              Continue with GitHub
            </button>

            <button @click="handleLogin('google')" class="oauth-button oauth-google">
              <svg class="oauth-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button @click="handleLogin('apple')" class="oauth-button oauth-apple">
              <svg class="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          <p class="login-footer">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

function handleLogin(provider: string) {
  authStore.login(provider)
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

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.oauth-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.oauth-button:hover {
  background-color: var(--bg-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.oauth-button:active {
  transform: translateY(0);
}

.oauth-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.oauth-github {
  border-color: #24292e;
}

.oauth-github:hover {
  background-color: #24292e;
  color: white;
  border-color: #24292e;
}

.oauth-apple:hover {
  background-color: #000;
  color: white;
  border-color: #000;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-light);
  line-height: 1.5;
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
