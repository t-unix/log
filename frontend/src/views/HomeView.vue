<template>
  <div class="home-view">
    <div class="container">
      <div class="welcome-section">
        <h1 class="welcome-title">Welcome back, {{ authStore.user?.name }}!</h1>
        <p class="welcome-subtitle">Here's an overview of your organization's assets</p>
      </div>

      <div class="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div class="stat-card card">
          <div class="stat-icon" style="background-color: #EEF2FF; color: #4F46E5;">📦</div>
          <div class="stat-content">
            <h3 class="stat-label">Total Assets</h3>
            <p class="stat-value">{{ stats.totalAssets }}</p>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon" style="background-color: #D1FAE5; color: #059669;">✅</div>
          <div class="stat-content">
            <h3 class="stat-label">Available</h3>
            <p class="stat-value">{{ stats.available }}</p>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon" style="background-color: #FEF3C7; color: #D97706;">🔄</div>
          <div class="stat-content">
            <h3 class="stat-label">On Loan</h3>
            <p class="stat-value">{{ stats.loaned }}</p>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon" style="background-color: #FEE2E2; color: #DC2626;">⚠️</div>
          <div class="stat-content">
            <h3 class="stat-label">Issues</h3>
            <p class="stat-value">{{ stats.issues }}</p>
          </div>
        </div>
      </div>

      <div class="content-grid grid grid-cols-1 lg:grid-cols-3">
        <div class="card recent-section">
          <h2 class="section-title">Recent Assets</h2>
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            Loading...
          </div>
          <div v-else-if="recentAssets.length === 0" class="empty-state">
            <p>No assets yet</p>
            <RouterLink to="/assets" class="btn btn-primary btn-sm">Add Asset</RouterLink>
          </div>
          <div v-else class="recent-list">
            <RouterLink
              v-for="asset in recentAssets"
              :key="asset.id"
              :to="`/assets/${asset.id}`"
              class="recent-item"
            >
              <div class="recent-item-content">
                <h3 class="recent-item-title">{{ asset.name }}</h3>
                <p class="recent-item-subtitle">{{ asset.category }}</p>
              </div>
              <span :class="['badge', `badge-${getStatusColor(asset.status)}`]">
                {{ asset.status }}
              </span>
            </RouterLink>
          </div>
        </div>

        <div class="card recent-section lg:col-span-2">
          <h2 class="section-title">Active Loans</h2>
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            Loading...
          </div>
          <div v-else-if="activeLoans.length === 0" class="empty-state">
            <p>No active loans</p>
          </div>
          <div v-else class="recent-list">
            <div
              v-for="loan in activeLoans"
              :key="loan.id"
              class="recent-item"
            >
              <div class="recent-item-content">
                <h3 class="recent-item-title">{{ loan.assetName }}</h3>
                <p class="recent-item-subtitle">Loaned to {{ loan.userName }}</p>
              </div>
              <div class="loan-info">
                <span class="loan-date">{{ formatDate(loan.loanedAt) }}</span>
                <button @click="returnLoan(loan.id)" class="btn btn-sm btn-primary">
                  Return
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h2 class="section-title">Quick Actions</h2>
        <div class="actions-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <RouterLink to="/assets" class="action-card card">
            <span class="action-icon">➕</span>
            <h3 class="action-title">Add Asset</h3>
            <p class="action-description">Register a new asset</p>
          </RouterLink>

          <RouterLink to="/loans" class="action-card card">
            <span class="action-icon">🔄</span>
            <h3 class="action-title">Loan Item</h3>
            <p class="action-description">Check out an asset</p>
          </RouterLink>

          <RouterLink to="/issues" class="action-card card">
            <span class="action-icon">⚠️</span>
            <h3 class="action-title">Report Issue</h3>
            <p class="action-description">Log a problem</p>
          </RouterLink>

          <RouterLink to="/logbook" class="action-card card">
            <span class="action-icon">📖</span>
            <h3 class="action-title">View Logbook</h3>
            <p class="action-description">See all activity</p>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useAssetsStore } from '../stores/assets'
import { useLoansStore } from '../stores/loans'

const authStore = useAuthStore()
const assetsStore = useAssetsStore()
const loansStore = useLoansStore()

const loading = ref(true)

const stats = computed(() => {
  const assets = assetsStore.assets || []
  return {
    totalAssets: assets.length,
    available: assets.filter(a => a.status === 'available').length,
    loaned: assets.filter(a => a.status === 'loaned').length,
    issues: 0 // Would come from issues store
  }
})

const recentAssets = computed(() => {
  const assets = assetsStore.assets || []
  return assets.slice(0, 5)
})

const activeLoans = computed(() => {
  const loans = loansStore.loans || []
  return loans.filter(l => l.status === 'active').slice(0, 5)
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    available: 'success',
    loaned: 'warning',
    maintenance: 'warning',
    retired: 'danger'
  }
  return colors[status] || 'primary'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

async function returnLoan(id: string) {
  try {
    await loansStore.returnLoan(id)
  } catch (error) {
    console.error('Failed to return loan:', error)
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      assetsStore.fetchAssets(),
      loansStore.fetchLoans()
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-view {
  padding: 1rem 0;
}

.welcome-section {
  margin-bottom: 2rem;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
}

.stats-grid {
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
}

.content-grid {
  margin-bottom: 2rem;
  gap: 1.5rem;
}

.recent-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-secondary);
  gap: 1rem;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: var(--radius-md);
  background-color: var(--bg-secondary);
  text-decoration: none;
  transition: var(--transition);
}

.recent-item:hover {
  background-color: var(--bg-tertiary);
  transform: translateX(4px);
}

.recent-item-content {
  flex: 1;
}

.recent-item-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.recent-item-subtitle {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.loan-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.loan-date {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.quick-actions {
  margin-top: 2rem;
}

.actions-grid {
  gap: 1rem;
}

.action-card {
  text-align: center;
  padding: 2rem 1.5rem;
  text-decoration: none;
  transition: var(--transition);
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.action-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.action-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 1.5rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .action-card {
    padding: 1.5rem 1rem;
  }
}
</style>
