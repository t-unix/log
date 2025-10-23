<template>
  <div class="loans-view">
    <div class="container">
      <div class="header-section">
        <div>
          <h1 class="page-title">Loans</h1>
          <p class="page-subtitle">Track asset loans and returns</p>
        </div>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <span>🔄</span>
          New Loan
        </button>
      </div>

      <div class="tabs">
        <button
          @click="activeTab = 'active'"
          :class="['tab', { active: activeTab === 'active' }]"
        >
          Active ({{ activeLoans.length }})
        </button>
        <button
          @click="activeTab = 'returned'"
          :class="['tab', { active: activeTab === 'returned' }]"
        >
          Returned ({{ returnedLoans.length }})
        </button>
      </div>

      <div v-if="loansStore.loading" class="loading-state">
        <div class="spinner"></div>
        Loading loans...
      </div>

      <div v-else-if="displayedLoans.length === 0" class="empty-state card">
        <span class="empty-icon">🔄</span>
        <h3>No {{ activeTab }} loans</h3>
        <p v-if="activeTab === 'active'">Start by creating a new loan</p>
        <button v-if="activeTab === 'active'" @click="showCreateModal = true" class="btn btn-primary">
          New Loan
        </button>
      </div>

      <div v-else class="loans-grid grid grid-cols-1">
        <div v-for="loan in displayedLoans" :key="loan.id" class="loan-card card">
          <div class="loan-header">
            <div>
              <h3 class="loan-asset">{{ loan.assetName }}</h3>
              <p class="loan-user">{{ loan.userName }}</p>
            </div>
            <span :class="['badge', `badge-${getStatusColor(loan.status)}`]">
              {{ loan.status }}
            </span>
          </div>

          <div class="loan-details">
            <div class="detail-row">
              <span class="detail-label">Loaned</span>
              <span class="detail-value">{{ formatDate(loan.loanedAt) }}</span>
            </div>
            <div v-if="loan.expectedReturnDate" class="detail-row">
              <span class="detail-label">Expected Return</span>
              <span class="detail-value">{{ formatDate(loan.expectedReturnDate) }}</span>
            </div>
            <div v-if="loan.returnedAt" class="detail-row">
              <span class="detail-label">Returned</span>
              <span class="detail-value">{{ formatDate(loan.returnedAt) }}</span>
            </div>
            <div v-if="loan.notes" class="detail-row full-width">
              <span class="detail-label">Notes</span>
              <span class="detail-value">{{ loan.notes }}</span>
            </div>
          </div>

          <div v-if="loan.status === 'active'" class="loan-actions">
            <button @click="handleReturn(loan.id)" class="btn btn-primary">
              Return Asset
            </button>
          </div>
        </div>
      </div>

      <!-- Create Loan Modal -->
      <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
        <div class="modal-content card" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Create New Loan</h2>
            <button @click="showCreateModal = false" class="modal-close">✕</button>
          </div>
          <form @submit.prevent="handleCreateLoan" class="modal-form">
            <div class="form-group">
              <label class="label">Asset*</label>
              <select v-model="newLoan.assetId" class="input" required>
                <option value="">Select an asset</option>
                <option v-for="asset in availableAssets" :key="asset.id" :value="asset.id">
                  {{ asset.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="label">Borrower Name*</label>
              <input v-model="newLoan.userName" type="text" class="input" required>
            </div>
            <div class="form-group">
              <label class="label">Expected Return Date</label>
              <input v-model="newLoan.expectedReturnDate" type="date" class="input">
            </div>
            <div class="form-group">
              <label class="label">Notes</label>
              <textarea v-model="newLoan.notes" class="input" rows="3"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showCreateModal = false" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loansStore.loading">
                <span v-if="loansStore.loading" class="spinner"></span>
                <span v-else>Create Loan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLoansStore } from '../stores/loans'
import { useAssetsStore } from '../stores/assets'

const loansStore = useLoansStore()
const assetsStore = useAssetsStore()

const activeTab = ref<'active' | 'returned'>('active')
const showCreateModal = ref(false)
const newLoan = ref({
  assetId: '',
  userName: '',
  expectedReturnDate: '',
  notes: ''
})

const activeLoans = computed(() =>
  loansStore.loans.filter(l => l.status === 'active' || l.status === 'overdue')
)

const returnedLoans = computed(() =>
  loansStore.loans.filter(l => l.status === 'returned')
)

const displayedLoans = computed(() =>
  activeTab.value === 'active' ? activeLoans.value : returnedLoans.value
)

const availableAssets = computed(() =>
  assetsStore.assets.filter(a => a.status === 'available')
)

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    active: 'primary',
    returned: 'success',
    overdue: 'danger'
  }
  return colors[status] || 'primary'
}

function formatDate(date?: string) {
  return date ? new Date(date).toLocaleDateString() : 'N/A'
}

async function handleCreateLoan() {
  try {
    await loansStore.createLoan(newLoan.value)
    showCreateModal.value = false
    newLoan.value = {
      assetId: '',
      userName: '',
      expectedReturnDate: '',
      notes: ''
    }
  } catch (error) {
    console.error('Failed to create loan:', error)
  }
}

async function handleReturn(loanId: string) {
  if (!confirm('Confirm that this asset has been returned?')) return

  try {
    await loansStore.returnLoan(loanId)
  } catch (error) {
    console.error('Failed to return loan:', error)
  }
}

onMounted(async () => {
  await Promise.all([
    loansStore.fetchLoans(),
    assetsStore.fetchAssets()
  ])
})
</script>

<style scoped>
.loans-view {
  padding: 1rem 0;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
  gap: 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
}

.loans-grid {
  gap: 1rem;
}

.loan-card {
  padding: 1.5rem;
}

.loan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.loan-asset {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.loan-user {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.loan-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-row.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.loan-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .header-section .btn {
    width: 100%;
  }

  .loan-details {
    grid-template-columns: 1fr;
  }
}
</style>
