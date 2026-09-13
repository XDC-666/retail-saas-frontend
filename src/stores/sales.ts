import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchSales, fetchStores } from '@/api/retail'
import type { SaleChannel, SaleRecord, SalesQuery, Store } from '@/types/domain'

export const useSalesStore = defineStore('sales', () => {
  const records = ref<SaleRecord[]>([])
  const stores = ref<Store[]>([])
  const total = ref(0)
  const loading = ref(false)
  const query = ref<SalesQuery>({
    tenantId: '',
    keyword: '',
    storeId: '',
    channel: '' as SaleChannel | '',
    from: '',
    to: '',
    page: 1,
    pageSize: 10,
  })

  async function loadStores(tenantId: string, token: string) {
    const data = await fetchStores(tenantId, token)
    stores.value = data.items
  }

  async function load(tenantId: string, token: string, resetPage = false) {
    if (resetPage) query.value.page = 1
    query.value.tenantId = tenantId
    loading.value = true
    try {
      const data = await fetchSales(query.value, token)
      records.value = data.items
      total.value = data.total
      query.value.page = data.page
      query.value.pageSize = data.pageSize
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    query.value.keyword = ''
    query.value.storeId = ''
    query.value.channel = ''
    query.value.from = ''
    query.value.to = ''
    query.value.page = 1
  }

  return { records, stores, total, loading, query, loadStores, load, resetFilters }
})
