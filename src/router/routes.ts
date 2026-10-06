import type { RouteRecordRaw } from 'vue-router'
import type { NavigationItem, RouteCode } from '@/types/domain'

export const routeManifest: Record<RouteCode, RouteRecordRaw> = {
  dashboard: {
    path: 'dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { permission: 'dashboard:view', title: '经营看板' },
  },
  sales: {
    path: 'sales',
    name: 'sales',
    component: () => import('@/views/sales/SalesView.vue'),
    meta: { permission: 'sales:view', title: '销售明细' },
  },
  stores: {
    path: 'stores',
    name: 'stores',
    component: () => import('@/views/stores/StoresView.vue'),
    meta: { permission: 'stores:view', title: '门店管理' },
  },
  permissions: {
    path: 'permissions',
    name: 'permissions',
    component: () => import('@/views/admin/PermissionView.vue'),
    meta: { permission: 'rbac:view', title: '权限配置' },
  },
}

export function getRouteByNavigation(item: NavigationItem) {
  return routeManifest[item.code]
}
