import { ref, computed } from 'vue'
import type { Contract, BudgetDistribution, Alert } from '~/types'

export function useTransparencyData(params: {
  page?: number;
  limit?: number;
  department?: string;
  search?: string;
  year?: number;
}) {
  const { data: contractsData, pending: contractsPending, error: contractsError } = useFetch('/api/contracts', {
    params: {
      page: params.page,
      limit: params.limit,
      department: params.department,
      search: params.search
    }
  })

  const { data: budgetData, pending: budgetPending, error: budgetError } = useFetch(`/api/transparency/${params.year || new Date().getFullYear()}`)

  return {
    contracts: computed(() => (contractsData.value as any)?.contracts || []),
    totalContracts: computed(() => (contractsData.value as any)?.total || 0),
    budget: computed(() => budgetData.value as BudgetDistribution),
    alerts: computed(() => [] as Alert[]),
    isLoading: computed(() => contractsPending.value || budgetPending.value),
    isError: computed(() => !!contractsError.value || !!budgetError.value),
    error: computed(() => contractsError.value || budgetError.value)
  }
}