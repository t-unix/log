<template>
  <div class="assets-view">
    <div class="container">
      <div class="header-section">
        <div>
          <h1 class="page-title">Assets</h1>
          <p class="page-subtitle">Manage your organization's assets</p>
        </div>
        <button @click="showAddModal = true" class="btn btn-primary">
          <span>➕</span>
          Add Asset
        </button>
      </div>

      <div class="filters-section">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search assets..."
          class="input search-input"
        >
        <select v-model="statusFilter" class="input filter-select">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="loaned">On Loan</option>
          <option value="maintenance">Maintenance</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      <div v-if="assetsStore.loading" class="loading-state">
        <div class="spinner"></div>
        Loading assets...
      </div>

      <div v-else-if="filteredAssets.length === 0" class="empty-state card">
        <span class="empty-icon">📦</span>
        <h3>No assets found</h3>
        <p>Start by adding your first asset</p>
        <button @click="showAddModal = true" class="btn btn-primary">
          Add Asset
        </button>
      </div>

      <div v-else class="assets-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="asset in filteredAssets"
          :key="asset.id"
          :to="`/assets/${asset.id}`"
          class="asset-card card"
        >
          <div class="asset-image" :style="getAssetImageStyle(asset)">
            <span v-if="!asset.photos || asset.photos.length === 0" class="asset-placeholder">
              📦
            </span>
          </div>
          <div class="asset-content">
            <div class="asset-header">
              <h3 class="asset-name">{{ asset.name }}</h3>
              <span :class="['badge', `badge-${getStatusColor(asset.status)}`]">
                {{ asset.status }}
              </span>
            </div>
            <p class="asset-category">{{ asset.category }}</p>
            <p v-if="asset.description" class="asset-description">
              {{ truncate(asset.description, 80) }}
            </p>
          </div>
        </RouterLink>
      </div>

      <!-- Add Asset Modal -->
      <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
        <div class="modal-content card" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Add New Asset</h2>
            <button @click="showAddModal = false" class="modal-close">✕</button>
          </div>
          <form @submit.prevent="handleAddAsset" class="modal-form">
            <div class="form-group">
              <label class="label">Asset Name*</label>
              <input v-model="newAsset.name" type="text" class="input" required>
            </div>
            <div class="form-group">
              <label class="label">Category*</label>
              <input v-model="newAsset.category" type="text" class="input" required>
            </div>
            <div class="form-group">
              <label class="label">Description</label>
              <textarea v-model="newAsset.description" class="input" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label class="label">Serial Number</label>
              <input v-model="newAsset.serialNumber" type="text" class="input">
            </div>
            <div class="form-group">
              <label class="label">Status</label>
              <select v-model="newAsset.status" class="input">
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showAddModal = false" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="assetsStore.loading">
                <span v-if="assetsStore.loading" class="spinner"></span>
                <span v-else>Create Asset</span>
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
import { RouterLink } from 'vue-router'
import { useAssetsStore } from '../stores/assets'

const assetsStore = useAssetsStore()

const searchQuery = ref('')
const statusFilter = ref('')
const showAddModal = ref(false)
const newAsset = ref({
  name: '',
  category: '',
  description: '',
  serialNumber: '',
  status: 'available' as const
})

const filteredAssets = computed(() => {
  let assets = assetsStore.assets

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    assets = assets.filter(a =>
      a.name.toLowerCase().includes(query) ||
      a.category.toLowerCase().includes(query) ||
      a.description?.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    assets = assets.filter(a => a.status === statusFilter.value)
  }

  return assets
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

function getAssetImageStyle(asset: any) {
  if (asset.photos && asset.photos.length > 0) {
    return {
      backgroundImage: `url(${asset.photos[0]})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }
  return {}
}

function truncate(text: string, length: number) {
  return text.length > length ? text.substring(0, length) + '...' : text
}

async function handleAddAsset() {
  try {
    await assetsStore.createAsset(newAsset.value)
    showAddModal.value = false
    newAsset.value = {
      name: '',
      category: '',
      description: '',
      serialNumber: '',
      status: 'available'
    }
  } catch (error) {
    console.error('Failed to create asset:', error)
  }
}

onMounted(() => {
  assetsStore.fetchAssets()
})
</script>

<style scoped>
.assets-view {
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

.filters-section {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input {
  max-width: 100%;
}

.filter-select {
  width: 200px;
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

.assets-grid {
  gap: 1.5rem;
}

.asset-card {
  text-decoration: none;
  overflow: hidden;
  padding: 0;
  transition: var(--transition);
}

.asset-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.asset-image {
  height: 200px;
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.asset-placeholder {
  font-size: 4rem;
}

.asset-content {
  padding: 1.5rem;
}

.asset-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.asset-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.asset-category {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.asset-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
  line-height: 1;
}

.modal-close:hover {
  color: var(--text-primary);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .filters-section {
    grid-template-columns: 1fr;
  }

  .filter-select {
    width: 100%;
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .header-section .btn {
    width: 100%;
  }
}
</style>
