export type Role = 'owner' | 'manager' | 'clerk'

export type Permission =
  | 'dashboard:view'
  | 'sales:view'
  | 'sales:export'
  | 'stores:view'
  | 'stores:manage'
  | 'rbac:view'
  | 'rbac:manage'

export type RouteCode = 'dashboard' | 'sales' | 'stores' | 'permissions'

export interface Tenant {
  id: string
  name: string
  plan: 'Enterprise' | 'Pro' | string
}

export interface User {
  id: string
  email: string
  name: string
  role: Role
  roleLabel: string
  tenantId: string
  accessibleTenantIds: string[]
  permissions: Permission[]
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  tenants: Tenant[]
}

export interface SessionResponse {
  user: User
  tenants: Tenant[]
}

export interface NavigationItem {
  code: RouteCode
  label: string
  path: string
  permission: Permission
  icon: 'chart' | 'receipt' | 'store' | 'shield'
}

export interface Store {
  id: string
  tenantId: string
  name: string
  city: string
  manager: string
  status: 'open' | 'closed'
  target: number
  address: string
  phone: string
}
export type StoreInput = Omit<Store, 'id' | 'tenantId'>

export interface OrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
}

export interface OrderEvent {
  id: string
  label: string
  detail: string
  time: string
  status: 'done' | 'current'
}

export interface OrderDetail {
  id: string
  orderNo: string
  tenantId: string
  storeId: string
  storeName: string
  customer: {
    name: string
    phone: string
    memberLevel: string
  }
  status: 'paid' | 'refunded' | 'completed'
  paymentMethod: string
  subtotal: number
  discount: number
  paidAmount: number
  refundAmount: number
  items: OrderItem[]
  timeline: OrderEvent[]
}

export interface RoleDefinition {
  id: Role
  name: string
  description: string
  userCount: number
  enabled: boolean
  permissions: Permission[]
}

export type SaleChannel = '线下门店' | '微信小程序' | '外卖平台'

export interface SaleRecord {
  id: string
  tenantId: string
  storeId: string
  storeName: string
  city: string
  date: string
  channel: SaleChannel
  amount: number
  orders: number
  refundRate: number
}

export interface SalesQuery {
  tenantId: string
  keyword?: string
  storeId?: string
  channel?: SaleChannel | ''
  from?: string
  to?: string
  page: number
  pageSize: number
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface DashboardMetrics {
  totalSales: number
  totalOrders: number
  avgOrderValue: number
  avgRefundRate: number
  salesChange: number
  ordersChange: number
  aovChange: number
  refundChange: number
}

export interface TrendPoint {
  date: string
  amount: number
  orders: number
}

export interface StoreRanking {
  storeId: string
  storeName: string
  city: string
  amount: number
  orders: number
}

export interface DashboardSummary {
  metrics: DashboardMetrics
  trend: TrendPoint[]
  ranking: StoreRanking[]
}
