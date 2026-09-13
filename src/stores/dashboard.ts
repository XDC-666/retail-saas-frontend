import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchDashboard } from '@/api/retail'
import type { DashboardSummary } from '@/types/domain'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref<DashboardSummary | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function load(tenantId: string, token: string) {
    loading.value = true
    error.value = ''
    try {
      data.value = await fetchDashboard(tenantId, token)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, load }
})
