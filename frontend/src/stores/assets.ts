import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export interface Asset {
  id: string
  name: string
  description: string
  category: string
  serialNumber?: string
  purchaseDate?: string
  status: 'available' | 'loaned' | 'maintenance' | 'retired'
  photos: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export const useAssetsStore = defineStore('assets', () => {
  const assets = ref<Asset[]>([])
  const currentAsset = ref<Asset | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAssets() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/assets')
      assets.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch assets'
    } finally {
      loading.value = false
    }
  }

  async function fetchAsset(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`/api/assets/${id}`)
      currentAsset.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch asset'
    } finally {
      loading.value = false
    }
  }

  async function createAsset(data: Partial<Asset>) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post('/api/assets', data)
      assets.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create asset'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAsset(id: string, data: Partial<Asset>) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.put(`/api/assets/${id}`, data)
      const index = assets.value.findIndex(a => a.id === id)
      if (index !== -1) {
        assets.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update asset'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAsset(id: string) {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`/api/assets/${id}`)
      assets.value = assets.value.filter(a => a.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete asset'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    assets,
    currentAsset,
    loading,
    error,
    fetchAssets,
    fetchAsset,
    createAsset,
    updateAsset,
    deleteAsset
  }
})
