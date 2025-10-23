<template>
  <div class="issues-view">
    <div class="container">
      <div class="header-section">
        <div>
          <h1 class="page-title">Issues</h1>
          <p class="page-subtitle">Track and manage asset issues</p>
        </div>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <span>⚠️</span>
          Report Issue
        </button>
      </div>

      <div class="tabs">
        <button
          @click="statusFilter = 'open'"
          :class="['tab', { active: statusFilter === 'open' }]"
        >
          Open ({{ openIssues.length }})
        </button>
        <button
          @click="statusFilter = 'in_progress'"
          :class="['tab', { active: statusFilter === 'in_progress' }]"
        >
          In Progress ({{ inProgressIssues.length }})
        </button>
        <button
          @click="statusFilter = 'resolved'"
          :class="['tab', { active: statusFilter === 'resolved' }]"
        >
          Resolved ({{ resolvedIssues.length }})
        </button>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        Loading issues...
      </div>

      <div v-else-if="displayedIssues.length === 0" class="empty-state card">
        <span class="empty-icon">⚠️</span>
        <h3>No {{ statusFilter }} issues</h3>
        <p v-if="statusFilter === 'open'">Report an issue to get started</p>
        <button v-if="statusFilter === 'open'" @click="showCreateModal = true" class="btn btn-primary">
          Report Issue
        </button>
      </div>

      <div v-else class="issues-grid grid grid-cols-1">
        <div v-for="issue in displayedIssues" :key="issue.id" class="issue-card card">
          <div class="issue-header">
            <div class="issue-title-section">
              <span class="issue-severity" :class="`severity-${issue.severity}`">
                {{ getSeverityIcon(issue.severity) }}
              </span>
              <div>
                <h3 class="issue-title">{{ issue.title }}</h3>
                <p class="issue-asset">{{ issue.assetName }}</p>
              </div>
            </div>
            <span :class="['badge', `badge-${getStatusColor(issue.status)}`]">
              {{ issue.status }}
            </span>
          </div>

          <p class="issue-description">{{ issue.description }}</p>

          <div class="issue-meta">
            <div class="meta-item">
              <span class="meta-label">Reported by</span>
              <span class="meta-value">{{ issue.reportedBy }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Date</span>
              <span class="meta-value">{{ formatDate(issue.createdAt) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Severity</span>
              <span :class="['severity-badge', `severity-${issue.severity}`]">
                {{ issue.severity }}
              </span>
            </div>
          </div>

          <div v-if="issue.status !== 'resolved'" class="issue-actions">
            <button
              v-if="issue.status === 'open'"
              @click="updateStatus(issue.id, 'in_progress')"
              class="btn btn-sm btn-primary"
            >
              Start Working
            </button>
            <button
              v-if="issue.status === 'in_progress'"
              @click="updateStatus(issue.id, 'resolved')"
              class="btn btn-sm btn-secondary"
            >
              Mark Resolved
            </button>
          </div>
        </div>
      </div>

      <!-- Create Issue Modal -->
      <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
        <div class="modal-content card" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Report New Issue</h2>
            <button @click="showCreateModal = false" class="modal-close">✕</button>
          </div>
          <form @submit.prevent="handleCreateIssue" class="modal-form">
            <div class="form-group">
              <label class="label">Asset*</label>
              <select v-model="newIssue.assetId" class="input" required>
                <option value="">Select an asset</option>
                <option v-for="asset in assets" :key="asset.id" :value="asset.id">
                  {{ asset.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="label">Issue Title*</label>
              <input v-model="newIssue.title" type="text" class="input" required>
            </div>
            <div class="form-group">
              <label class="label">Description*</label>
              <textarea v-model="newIssue.description" class="input" rows="4" required></textarea>
            </div>
            <div class="form-group">
              <label class="label">Severity*</label>
              <select v-model="newIssue.severity" class="input" required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showCreateModal = false" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner"></span>
                <span v-else>Report Issue</span>
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
import { useAssetsStore } from '../stores/assets'

interface Issue {
  id: string
  assetId: string
  assetName: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved'
  reportedBy: string
  createdAt: string
}

const assetsStore = useAssetsStore()

const loading = ref(false)
const statusFilter = ref<'open' | 'in_progress' | 'resolved'>('open')
const showCreateModal = ref(false)
const issues = ref<Issue[]>([])
const newIssue = ref({
  assetId: '',
  title: '',
  description: '',
  severity: 'medium' as const
})

const assets = computed(() => assetsStore.assets)

const openIssues = computed(() => issues.value.filter(i => i.status === 'open'))
const inProgressIssues = computed(() => issues.value.filter(i => i.status === 'in_progress'))
const resolvedIssues = computed(() => issues.value.filter(i => i.status === 'resolved'))

const displayedIssues = computed(() => {
  return issues.value.filter(i => i.status === statusFilter.value)
})

function getSeverityIcon(severity: string) {
  const icons: Record<string, string> = {
    low: 'ℹ️',
    medium: '⚠️',
    high: '🔴',
    critical: '🚨'
  }
  return icons[severity] || '⚠️'
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    open: 'danger',
    in_progress: 'warning',
    resolved: 'success'
  }
  return colors[status] || 'primary'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

async function handleCreateIssue() {
  loading.value = true
  try {
    // In a real app, send to API
    const asset = assets.value.find(a => a.id === newIssue.value.assetId)
    issues.value.unshift({
      id: Date.now().toString(),
      assetId: newIssue.value.assetId,
      assetName: asset?.name || 'Unknown',
      title: newIssue.value.title,
      description: newIssue.value.description,
      severity: newIssue.value.severity,
      status: 'open',
      reportedBy: 'Current User',
      createdAt: new Date().toISOString()
    })

    showCreateModal.value = false
    newIssue.value = {
      assetId: '',
      title: '',
      description: '',
      severity: 'medium'
    }
  } finally {
    loading.value = false
  }
}

async function updateStatus(issueId: string, newStatus: 'open' | 'in_progress' | 'resolved') {
  const issue = issues.value.find(i => i.id === issueId)
  if (issue) {
    issue.status = newStatus
  }
}

onMounted(async () => {
  await assetsStore.fetchAssets()
  // Mock data for demonstration
  issues.value = [
    {
      id: '1',
      assetId: '1',
      assetName: 'MacBook Pro 16"',
      title: 'Screen flickering issue',
      description: 'The screen flickers intermittently, especially when brightness is above 80%',
      severity: 'high',
      status: 'open',
      reportedBy: 'John Doe',
      createdAt: new Date().toISOString()
    }
  ]
})
</script>

<style scoped>
.issues-view {
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

.issues-grid {
  gap: 1rem;
}

.issue-card {
  padding: 1.5rem;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.issue-title-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.issue-severity {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.issue-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.issue-asset {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.issue-description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.issue-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.meta-value {
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.severity-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.severity-badge.severity-low {
  background-color: #DBEAFE;
  color: #1E40AF;
}

.severity-badge.severity-medium {
  background-color: #FEF3C7;
  color: #D97706;
}

.severity-badge.severity-high {
  background-color: #FECACA;
  color: #DC2626;
}

.severity-badge.severity-critical {
  background-color: #FEE2E2;
  color: #991B1B;
}

.issue-actions {
  display: flex;
  gap: 0.75rem;
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

  .tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab {
    white-space: nowrap;
    padding: 0.75rem 1rem;
  }

  .issue-meta {
    grid-template-columns: 1fr;
  }
}
</style>
