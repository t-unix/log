<template>
  <div class="asset-detail-view">
    <div class="container">
      <button @click="$router.back()" class="btn btn-secondary back-btn">
        ← Back
      </button>

      <div v-if="assetsStore.loading" class="loading-state">
        <div class="spinner"></div>
        Loading asset...
      </div>

      <div v-else-if="asset" class="asset-detail">
        <div class="detail-grid">
          <div class="asset-images card">
            <div class="main-image" :style="getMainImageStyle()">
              <span v-if="!asset.photos || asset.photos.length === 0" class="image-placeholder">
                📦
              </span>
              <button class="photo-btn" @click="showPhotoModal = true">
                📷 Add Photo
              </button>
            </div>
            <div v-if="asset.photos && asset.photos.length > 0" class="image-thumbnails">
              <div
                v-for="(photo, index) in asset.photos"
                :key="index"
                class="thumbnail"
                :style="{ backgroundImage: `url(${photo})` }"
              ></div>
            </div>
          </div>

          <div class="asset-info">
            <div class="card info-section">
              <div class="info-header">
                <h1 class="asset-title">{{ asset.name }}</h1>
                <span :class="['badge badge-lg', `badge-${getStatusColor(asset.status)}`]">
                  {{ asset.status }}
                </span>
              </div>
              <p class="asset-category">{{ asset.category }}</p>

              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Serial Number</span>
                  <span class="info-value">{{ asset.serialNumber || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Purchase Date</span>
                  <span class="info-value">{{ formatDate(asset.purchaseDate) || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Created</span>
                  <span class="info-value">{{ formatDate(asset.createdAt) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Last Updated</span>
                  <span class="info-value">{{ formatDate(asset.updatedAt) }}</span>
                </div>
              </div>

              <div v-if="asset.description" class="description-section">
                <h3 class="section-title">Description</h3>
                <p class="description-text">{{ asset.description }}</p>
              </div>

              <div class="actions-section">
                <button
                  v-if="asset.status === 'available'"
                  @click="showLoanModal = true"
                  class="btn btn-primary"
                >
                  🔄 Loan Asset
                </button>
                <button @click="showEditModal = true" class="btn btn-secondary">
                  ✏️ Edit
                </button>
                <button @click="handleDelete" class="btn btn-danger">
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Photo Upload Modal -->
      <div v-if="showPhotoModal" class="modal-overlay" @click="showPhotoModal = false">
        <div class="modal-content card" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Add Photo</h2>
            <button @click="showPhotoModal = false" class="modal-close">✕</button>
          </div>
          <div class="photo-upload">
            <input
              ref="photoInput"
              type="file"
              accept="image/*"
              capture="environment"
              @change="handlePhotoUpload"
              class="photo-input"
            >
            <button @click="photoInput?.click()" class="btn btn-primary">
              📷 Choose Photo
            </button>
            <p class="photo-hint">Select from gallery or take a new photo</p>
          </div>
        </div>
      </div>

      <!-- Loan Modal -->
      <div v-if="showLoanModal" class="modal-overlay" @click="showLoanModal = false">
        <div class="modal-content card" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Loan Asset</h2>
            <button @click="showLoanModal = false" class="modal-close">✕</button>
          </div>
          <form @submit.prevent="handleLoan" class="modal-form">
            <div class="form-group">
              <label class="form-label">Expected Return Date</label>
              <input
                v-model="loanForm.expectedReturnDate"
                type="date"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea
                v-model="loanForm.notes"
                class="form-input"
                rows="3"
                placeholder="Add any notes about this loan..."
              ></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showLoanModal = false" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Confirm Loan
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
        <div class="modal-content card" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Edit Asset</h2>
            <button @click="showEditModal = false" class="modal-close">✕</button>
          </div>
          <form @submit.prevent="handleEdit" class="modal-form">
            <div class="form-group">
              <label class="form-label">Name *</label>
              <input
                v-model="editForm.name"
                type="text"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Category *</label>
              <input
                v-model="editForm.category"
                type="text"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="editForm.description"
                class="form-input"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Serial Number</label>
              <input
                v-model="editForm.serialNumber"
                type="text"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Purchase Date</label>
              <input
                v-model="editForm.purchaseDate"
                type="date"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select v-model="editForm.status" class="form-input">
                <option value="available">Available</option>
                <option value="loaned">Loaned</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showEditModal = false" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssetsStore } from '../stores/assets'
import { useLoansStore } from '../stores/loans'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const assetsStore = useAssetsStore()
const loansStore = useLoansStore()

const showPhotoModal = ref(false)
const showEditModal = ref(false)
const showLoanModal = ref(false)
const photoInput = ref<HTMLInputElement>()

const loanForm = ref({
  expectedReturnDate: '',
  notes: ''
})

const editForm = ref({
  name: '',
  category: '',
  description: '',
  serialNumber: '',
  purchaseDate: '',
  status: 'available' as 'available' | 'loaned' | 'maintenance' | 'retired'
})

const asset = computed(() => assetsStore.currentAsset)

// Populate edit form when asset loads
watch(asset, (newAsset) => {
  if (newAsset) {
    editForm.value = {
      name: newAsset.name,
      category: newAsset.category,
      description: newAsset.description || '',
      serialNumber: newAsset.serialNumber || '',
      purchaseDate: newAsset.purchaseDate || '',
      status: newAsset.status
    }
  }
}, { immediate: true })

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    available: 'success',
    loaned: 'warning',
    maintenance: 'warning',
    retired: 'danger'
  }
  return colors[status] || 'primary'
}

function getMainImageStyle() {
  if (asset.value?.photos && asset.value.photos.length > 0) {
    return {
      backgroundImage: `url(${asset.value.photos[0]})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }
  return {}
}

function formatDate(date?: string) {
  return date ? new Date(date).toLocaleDateString() : null
}

async function handlePhotoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !asset.value) return

  // In a real app, upload to server and get URL
  const reader = new FileReader()
  reader.onload = async (e) => {
    const photoUrl = e.target?.result as string
    await assetsStore.updateAsset(asset.value!.id, {
      photos: [...(asset.value!.photos || []), photoUrl]
    })
    showPhotoModal.value = false
  }
  reader.readAsDataURL(file)
}

async function handleLoan() {
  if (!asset.value) return

  try {
    await axios.post('/api/loans', {
      assetId: asset.value.id,
      expectedReturnDate: loanForm.value.expectedReturnDate || undefined,
      notes: loanForm.value.notes || undefined
    })

    // Refresh asset to show updated status
    await assetsStore.fetchAsset(asset.value.id)

    // Reset form and close modal
    loanForm.value = {
      expectedReturnDate: '',
      notes: ''
    }
    showLoanModal.value = false

    alert('Asset loaned successfully!')
  } catch (error: any) {
    console.error('Failed to create loan:', error)
    alert(error.response?.data?.error || 'Failed to create loan')
  }
}

async function handleEdit() {
  if (!asset.value) return

  try {
    await assetsStore.updateAsset(asset.value.id, editForm.value)
    showEditModal.value = false
    alert('Asset updated successfully!')
  } catch (error) {
    console.error('Failed to update asset:', error)
    alert('Failed to update asset')
  }
}

async function handleDelete() {
  if (!asset.value) return
  if (!confirm('Are you sure you want to delete this asset?')) return

  try {
    await assetsStore.deleteAsset(asset.value.id)
    router.push('/assets')
  } catch (error) {
    console.error('Failed to delete asset:', error)
  }
}

onMounted(() => {
  const id = route.params.id as string
  assetsStore.fetchAsset(id)
})
</script>

<style scoped>
.asset-detail-view {
  padding: 1rem 0;
}

.back-btn {
  margin-bottom: 1.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
  gap: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .detail-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.asset-images {
  padding: 0;
  overflow: hidden;
}

.main-image {
  height: 400px;
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.image-placeholder {
  font-size: 6rem;
}

.photo-btn {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
}

.photo-btn:hover {
  background-color: var(--primary-dark);
}

.image-thumbnails {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
  padding: 1rem;
}

.thumbnail {
  height: 100px;
  background-color: var(--bg-secondary);
  background-size: cover;
  background-position: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.thumbnail:hover {
  transform: scale(1.05);
}

.info-section {
  height: fit-content;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.asset-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.badge-lg {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.asset-category {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
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

.description-section {
  margin-bottom: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.description-text {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.actions-section {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.photo-input {
  display: none;
}

.photo-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
}

@media (max-width: 768px) {
  .asset-title {
    font-size: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .actions-section {
    flex-direction: column;
  }

  .actions-section .btn {
    width: 100%;
  }
}
</style>
