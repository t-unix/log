<template>
  <div class="profile-view">
    <div class="container">
      <h1 class="page-title">Profile</h1>

      <div class="profile-grid">
        <div class="card profile-card">
          <div class="profile-header">
            <div class="avatar-large">
              <img
                v-if="authStore.user?.avatar"
                :src="authStore.user.avatar"
                :alt="authStore.user.name"
              >
              <div v-else class="avatar-placeholder">
                {{ authStore.user?.name?.charAt(0) || 'U' }}
              </div>
            </div>
            <div>
              <h2 class="profile-name">{{ authStore.user?.name }}</h2>
              <p class="profile-email">{{ authStore.user?.email }}</p>
              <span class="badge badge-primary">{{ authStore.user?.role }}</span>
            </div>
          </div>

          <div class="profile-info">
            <div class="info-item">
              <span class="info-label">Organization ID</span>
              <span class="info-value">{{ authStore.user?.organizationId }}</span>
            </div>
          </div>

          <div class="profile-actions">
            <button @click="handleLogout" class="btn btn-danger">
              🚪 Logout
            </button>
          </div>
        </div>

        <div class="card settings-card">
          <h2 class="section-title">Settings</h2>

          <div class="settings-section">
            <h3 class="settings-subtitle">Notifications</h3>
            <label class="setting-item">
              <input type="checkbox" v-model="settings.emailNotifications">
              <span>Email notifications</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" v-model="settings.loanReminders">
              <span>Loan return reminders</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" v-model="settings.issueAlerts">
              <span>Issue alerts</span>
            </label>
          </div>

          <div class="settings-section">
            <h3 class="settings-subtitle">Preferences</h3>
            <div class="setting-item">
              <label class="label">Theme</label>
              <select v-model="settings.theme" class="input">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>

          <button @click="saveSettings" class="btn btn-primary">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const settings = ref({
  emailNotifications: true,
  loanReminders: true,
  issueAlerts: true,
  theme: 'light'
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function saveSettings() {
  // In a real app, save to backend
  console.log('Settings saved:', settings.value)
  alert('Settings saved successfully!')
}
</script>

<style scoped>
.profile-view {
  padding: 1rem 0;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.profile-card,
.settings-card {
  height: fit-content;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.avatar-large {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border-color);
  flex-shrink: 0;
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  font-size: 2rem;
  font-weight: 600;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.profile-email {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: var(--text-primary);
}

.profile-actions {
  display: flex;
  gap: 0.75rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  cursor: pointer;
}

.setting-item input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.setting-item span {
  font-size: 0.9375rem;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .avatar-large {
    width: 6rem;
    height: 6rem;
  }

  .profile-actions {
    flex-direction: column;
  }

  .profile-actions .btn {
    width: 100%;
  }
}
</style>
