import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, logoutApi, navigationApi, sessionApi } from '@/api/auth'
import type { LoginPayload, NavigationItem, Permission, Tenant, User } from '@/types/domain'
import { storage } from '@/utils/platformStorage'
import { hasPermission } from '@/utils/rbac'

const TOKEN_KEY = 'demo-token'
const TENANT_KEY = 'tenant-id'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const tenantOptions = ref<Tenant[]>([])
  const activeTenantId = ref('')
  const navigation = ref<NavigationItem[]>([])
  const hydrated = ref(false)
  const accessReady = ref(false)

  const activeTenant = computed(() => tenantOptions.value.find((tenant) => tenant.id === activeTenantId.value) || null)
  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const permissions = computed(() => user.value?.permissions || [])

  function can(permission?: Permission | Permission[]) {
    return hasPermission(permissions.value, permission)
  }

  async function hydrateSession(sessionToken: string) {
    const data = await sessionApi(sessionToken)
    token.value = sessionToken
    user.value = data.user
    tenantOptions.value = data.tenants
    const persistedTenant = await storage.get(TENANT_KEY)
    activeTenantId.value = persistedTenant && data.tenants.some((tenant) => tenant.id === persistedTenant)
      ? persistedTenant
      : data.user.tenantId
  }

  async function login(payload: LoginPayload) {
    const data = await loginApi(payload)
    token.value = data.token
    user.value = data.user
    tenantOptions.value = data.tenants
    activeTenantId.value = data.user.tenantId
    navigation.value = []
    accessReady.value = false
    await storage.set(TOKEN_KEY, data.token)
    await storage.set(TENANT_KEY, activeTenantId.value)
  }

  async function restore() {
    if (hydrated.value) return
    hydrated.value = true
    const persisted = await storage.get(TOKEN_KEY)
    if (!persisted) return
    try {
      await hydrateSession(persisted)
    } catch {
      await clearLocalSession()
    }
  }

  async function loadAccess() {
    if (!token.value || accessReady.value) return
    const data = await navigationApi(token.value)
    navigation.value = data.items
    accessReady.value = true
  }

  async function switchTenant(tenantId: string) {
    if (!tenantOptions.value.some((tenant) => tenant.id === tenantId)) return
    activeTenantId.value = tenantId
    await storage.set(TENANT_KEY, tenantId)
  }

  async function clearLocalSession() {
    token.value = null
    user.value = null
    tenantOptions.value = []
    activeTenantId.value = ''
    navigation.value = []
    accessReady.value = false
    await storage.remove(TOKEN_KEY)
    await storage.remove(TENANT_KEY)
  }

  async function logout() {
    const currentToken = token.value
    if (currentToken) await logoutApi(currentToken).catch(() => undefined)
    await clearLocalSession()
  }

  return {
    token,
    user,
    tenantOptions,
    activeTenantId,
    activeTenant,
    navigation,
    permissions,
    hydrated,
    accessReady,
    isAuthenticated,
    can,
    login,
    restore,
    loadAccess,
    switchTenant,
    logout,
  }
})
