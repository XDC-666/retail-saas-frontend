import { createRouter, createWebHashHistory, type Router } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { getRouteByNavigation } from './routes'
import type { NavigationItem, Permission } from '@/types/domain'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/LoginView.vue'),
      meta: { public: true, title: '登录' },
    },
    {
      path: '/',
      name: 'app',
      component: AppLayout,
      children: [],
    },
    {
      path: '/403',
      name: 'forbidden',
      component: () => import('@/views/system/ForbiddenView.vue'),
      meta: { title: '无权限' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/system/NotFoundView.vue'),
      meta: { title: '页面不存在' },
    },
  ],
})

const dynamicRouteNames = new Set<string>()

export function installAuthorizedRoutes(targetRouter: Router, items: NavigationItem[]) {
  for (const item of items) {
    const record = getRouteByNavigation(item)
    const name = String(record.name)
    if (!dynamicRouteNames.has(name)) {
      targetRouter.addRoute('app', record)
      dynamicRouteNames.add(name)
    }
  }
}

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.restore()

  if (to.meta.public) {
    if (to.name === 'login' && auth.isAuthenticated) {
      await auth.loadAccess()
      installAuthorizedRoutes(router, auth.navigation)
      return auth.navigation[0]?.path || '/403'
    }
    return true
  }

  if (!auth.isAuthenticated) {
    return { path: '/login', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } }
  }

  if (!auth.accessReady) {
    await auth.loadAccess()
    installAuthorizedRoutes(router, auth.navigation)
    const resolved = router.resolve(to.fullPath)
    if (resolved.name !== 'not-found') return to.fullPath
  }

  if (to.path === '/') return auth.navigation[0]?.path || '/403'

  const permission = to.meta.permission as Permission | undefined
  if (permission && !auth.can(permission)) return '/403'

  return true
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : 'RetailOps'
  document.title = `${title} · RetailOps`
})

export default router
