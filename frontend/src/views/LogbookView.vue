<template>
  <div class="logbook-view">
    <div class="container">
      <div class="header-section">
        <div>
          <h1 class="page-title">Logbook</h1>
          <p class="page-subtitle">Activity history and logs</p>
        </div>
      </div>

      <div class="filters-section">
        <select v-model="typeFilter" class="input filter-select">
          <option value="">All Activity</option>
          <option value="loan">Loans</option>
          <option value="return">Returns</option>
          <option value="issue">Issues</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <input v-model="dateFilter" type="date" class="input filter-select">
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        Loading logbook...
      </div>

      <div v-else-if="filteredLogs.length === 0" class="empty-state card">
        <span class="empty-icon">📖</span>
        <h3>No activity logs</h3>
        <p>Activity will appear here as you use the system</p>
      </div>

      <div v-else class="timeline">
        <div v-for="log in filteredLogs" :key="log.id" class="timeline-item">
          <div class="timeline-marker" :style="{ backgroundColor: getTypeColor(log.type) }">
            {{ getTypeIcon(log.type) }}
          </div>
          <div class="timeline-content card">
            <div class="log-header">
              <h3 class="log-title">{{ log.title }}</h3>
              <span class="log-time">{{ formatDateTime(log.createdAt) }}</span>
            </div>
            <p class="log-description">{{ log.description }}</p>
            <div class="log-meta">
              <span class="log-user">👤 {{ log.userName }}</span>
              <span :class="['badge', `badge-${getTypeBadge(log.type)}`]">
                {{ log.type }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface LogEntry {
  id: string
  type: 'loan' | 'return' | 'issue' | 'maintenance' | 'create' | 'update'
  title: string
  description: string
  userName: string
  createdAt: string
}

const loading = ref(false)
const typeFilter = ref('')
const dateFilter = ref('')
const logs = ref<LogEntry[]>([])

const filteredLogs = computed(() => {
  let filtered = logs.value

  if (typeFilter.value) {
    filtered = filtered.filter(l => l.type === typeFilter.value)
  }

  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value).toDateString()
    filtered = filtered.filter(l =>
      new Date(l.createdAt).toDateString() === filterDate
    )
  }

  return filtered
})

function getTypeIcon(type: string) {
  const icons: Record<string, string> = {
    loan: '🔄',
    return: '✅',
    issue: '⚠️',
    maintenance: '🔧',
    create: '➕',
    update: '✏️'
  }
  return icons[type] || '📝'
}

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    loan: '#F59E0B',
    return: '#10B981',
    issue: '#EF4444',
    maintenance: '#6366F1',
    create: '#4F46E5',
    update: '#8B5CF6'
  }
  return colors[type] || '#6B7280'
}

function getTypeBadge(type: string) {
  const badges: Record<string, string> = {
    loan: 'warning',
    return: 'success',
    issue: 'danger',
    maintenance: 'primary',
    create: 'primary',
    update: 'primary'
  }
  return badges[type] || 'primary'
}

function formatDateTime(date: string) {
  const d = new Date(date)
  return d.toLocaleString()
}

async function fetchLogs() {
  loading.value = true
  try {
    // In a real app, fetch from API
    // For now, using mock data
    logs.value = [
      {
        id: '1',
        type: 'loan',
        title: 'Laptop loaned to John Doe',
        description: 'MacBook Pro 16" loaned for project work',
        userName: 'Admin User',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'create',
        title: 'New asset added',
        description: 'iPad Pro 12.9" added to inventory',
        userName: 'Admin User',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.logbook-view {
  padding: 1rem 0;
}

.header-section {
  margin-bottom: 2rem;
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

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-select {
  flex: 1;
  max-width: 200px;
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

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 1.25rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--border-color);
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border: 3px solid var(--bg-secondary);
}

.timeline-content {
  margin-left: 1.5rem;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.log-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.log-time {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.log-description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.log-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.log-user {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .filters-section {
    flex-direction: column;
  }

  .filter-select {
    max-width: 100%;
  }

  .timeline {
    padding-left: 1.5rem;
  }

  .timeline-marker {
    left: -1.5rem;
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }

  .timeline-content {
    margin-left: 1rem;
  }

  .log-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .log-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
