import { apiRequest } from '@/api/client'
export function installPerformanceMonitor() {
  window.addEventListener('load', () => setTimeout(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    const paints = performance.getEntriesByType('paint'); const fcp = paints.find((p) => p.name === 'first-contentful-paint')?.startTime
    const payload = { fcp, ttfb: nav ? nav.responseStart - nav.requestStart : undefined, domInteractive: nav?.domInteractive }
    void apiRequest('/api/log/performance', { method: 'POST', body: JSON.stringify(payload) }).catch(() => undefined)
  }, 0))
}
