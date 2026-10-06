import { apiRequest } from './client'
import type {
  DashboardSummary,
  OrderDetail,
  PageResult,
  Permission,
  RoleDefinition,
  SaleRecord,
  SalesQuery,
  Store,
  StoreInput,
} from '@/types/domain'

/** 把对象转成 query string，自动跳过空值 */
function params(input: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  return search.toString()
}

export function fetchDashboard(tenantId: string, token: string) {
  return apiRequest<DashboardSummary>(`/api/dashboard?${params({ tenantId })}`, {}, token)
}

export function fetchStores(tenantId: string, token: string) {
  return apiRequest<{ items: Store[] }>(`/api/stores?${params({ tenantId })}`, {}, token)
}

export function updateStoreStatus(storeId: string, status: Store['status'], token: string) {
  return apiRequest<{ item: Store }>(
    `/api/stores/${storeId}`,
    { method: 'PATCH', body: JSON.stringify({ status }) },
    token,
  )
}

/** 新增或更新门店，传入 storeId 时走更新 */
export function saveStore(input: StoreInput, token: string, storeId?: string) {
  return apiRequest<{ item: Store }>(
    storeId ? `/api/stores/${storeId}` : '/api/stores',
    { method: storeId ? 'PATCH' : 'POST', body: JSON.stringify(input) },
    token,
  )
}

export function fetchOrder(id: string, token: string) {
  return apiRequest<{ item: OrderDetail }>(`/api/orders/${id}`, {}, token)
}

export function fetchRoles(token: string) {
  return apiRequest<{
    items: RoleDefinition[]
    permissions: { code: Permission; label: string; group: string }[]
  }>('/api/rbac/roles', {}, token)
}

export function updateRole(
  id: string,
  input: Pick<RoleDefinition, 'permissions' | 'enabled'>,
  token: string,
) {
  return apiRequest<{ item: RoleDefinition }>(
    `/api/rbac/roles/${id}`,
    { method: 'PATCH', body: JSON.stringify(input) },
    token,
  )
}

/** 压测虚拟列表用的大数据量接口，mock 侧会合成 large-N 的 id */
export function fetchLargeSales(tenantId: string, token: string, count = 100000) {
  return apiRequest<{ items: SaleRecord[]; total: number }>(
    `/api/sales/mock-large?${params({ tenantId, count })}`,
    {},
    token,
  )
}

export function fetchSales(query: SalesQuery, token: string) {
  const search = params(query as unknown as Record<string, string | number | undefined>)
  return apiRequest<PageResult<SaleRecord>>(`/api/sales?${search}`, {}, token)
}