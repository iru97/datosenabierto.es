import { defineStore } from 'pinia'
import type { Contract, BudgetDistribution, Alert } from '~/types'

export const useTransparencyStore = defineStore('transparency', {
  state: () => ({
    contracts: [] as Contract[],
    budget: null as BudgetDistribution | null,
    alerts: [] as Alert[],
    loading: false,
    error: null as Error | null,
    filters: {
      department: 'all',
      search: '',
      page: 1,
      limit: 10
    }
  }),

  getters: {
    totalPages: (state) => Math.ceil(state.contracts.length / state.filters.limit),
    filteredContracts: (state) => {
      let filtered = [...state.contracts]
      
      if (state.filters.department !== 'all') {
        filtered = filtered.filter(c => c.department === state.filters.department)
      }
      
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase()
        filtered = filtered.filter(c => 
          c.title.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search)
        )
      }
      
      return filtered
    },
    paginatedContracts: (state) => {
      const start = (state.filters.page - 1) * state.filters.limit
      const end = start + state.filters.limit
      return state.filteredContracts.slice(start, end)
    }
  },

  actions: {
    async fetchData() {
      this.loading = true
      this.error = null
      
      try {
        const [contractsRes, budgetRes] = await Promise.all([
          useFetch('/api/contracts', {
            params: {
              page: this.filters.page,
              limit: this.filters.limit,
              department: this.filters.department === 'all' ? undefined : this.filters.department,
              search: this.filters.search || undefined
            }
          }),
          useFetch(`/api/transparency/${new Date().getFullYear()}`)
        ])

        if (contractsRes.error.value) throw contractsRes.error.value
        if (budgetRes.error.value) throw budgetRes.error.value

        this.contracts = contractsRes.data.value?.contracts || []
        this.budget = budgetRes.data.value
      } catch (error) {
        this.error = error as Error
        console.error('Error fetching transparency data:', error)
      } finally {
        this.loading = false
      }
    },

    updateFilters(newFilters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...newFilters }
      if (Object.keys(newFilters).some(k => k !== 'page')) {
        this.filters.page = 1
      }
      this.fetchData()
    }
  }
})