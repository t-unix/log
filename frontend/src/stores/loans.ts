import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export interface Loan {
  id: string
  assetId: string
  assetName: string
  userId: string
  userName: string
  loanedAt: string
  returnedAt?: string
  expectedReturnDate?: string
  status: 'active' | 'returned' | 'overdue'
  notes?: string
}

export const useLoansStore = defineStore('loans', () => {
  const loans = ref<Loan[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLoans() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/loans')
      loans.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch loans'
    } finally {
      loading.value = false
    }
  }

  async function createLoan(data: Partial<Loan>) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post('/api/loans', data)
      loans.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create loan'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function returnLoan(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`/api/loans/${id}/return`)
      const index = loans.value.findIndex(l => l.id === id)
      if (index !== -1) {
        loans.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to return loan'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loans,
    loading,
    error,
    fetchLoans,
    createLoan,
    returnLoan
  }
})
