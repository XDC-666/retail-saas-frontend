import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { request } from '@/api/client'

type Permission = 'dashboard:view' | 'sales:view' | 'sales:export' | 'stores:view' | 'stores:manage'

interface User {
  id: string
  name: string
  roleLabel: string
  tenantId: string
  permissions: Permission[]
}

interface Tenant {
  id: string
  name: string
  plan: string
}

const TOKEN_KEY = 'retailops:token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref<User | null>(null)
  const tenants = ref<Tenant[]>([])
  const activeTenantId = ref('')
  const isAuthenticated = computed(() => Boolean(token.value && user.value))

  function can(permission: Permission) {
    return Boolean(user.value?.permissions.includes(permission))
  }

  async function login(email = 'owner@demo.local', password = '123456') {
    const data = await request<{ token: string; user: User; tenants: Tenant[] }>('/auth/login', {
      method: 'POST', data: { email, password },
    })
    token.value = data.token
    user.value = data.user
    tenants.value = data.tenants
    activeTenantId.value = data.user.tenantId
    uni.setStorageSync(TOKEN_KEY, data.token)
  }

  async function restore() {
    const saved = uni.getStorageSync(TOKEN_KEY) as string
    if (!saved) return
    token.value = saved
    try {
      const data = await request<{ user: User; tenants: Tenant[] }>('/session')
      user.value = data.user
      tenants.value = data.tenants
      activeTenantId.value = data.user.tenantId
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    tenants.value = []
    uni.removeStorageSync(TOKEN_KEY)
  }

  return { token, user, tenants, activeTenantId, isAuthenticated, can, login, restore, logout }
})
