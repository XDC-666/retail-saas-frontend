import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchStores, saveStore, updateStoreStatus } from '@/api/retail'
import type { Store, StoreInput } from '@/types/domain'

export const useStoresStore = defineStore('stores', () => {
  const items = ref<Store[]>([])
  const loading = ref(false)

  async function load(tenantId: string, token: string) {
    loading.value = true
    try {
      const data = await fetchStores(tenantId, token)
      items.value = data.items
    } finally {
      loading.value = false
    }
  }

  function replace(store: Store) {
    const index = items.value.findIndex((item) => item.id === store.id)
    if (index >= 0) items.value[index] = store
  }

  async function toggleStatus(store: Store, token: string) {
    const next = store.status === 'open' ? 'closed' : 'open'
    const data = await updateStoreStatus(store.id, next, token)
    replace(data.item)
  }

  /** 已存在则原地更新，否则插到列表头部 */
  async function save(input: StoreInput, token: string, id?: string) {
    const data = await saveStore(input, token, id)
    const index = items.value.findIndex((item) => item.id === data.item.id)
    if (index >= 0) {
      items.value[index] = data.item
    } else {
      items.value.unshift(data.item)
    }
    return data.item
  }

  return { items, loading, load, toggleStatus, save }
})
