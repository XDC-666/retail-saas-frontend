import { apiRequest } from '@/api/client'

/** 上报首屏关键指标，浏览器不支持时字段为 undefined */
export function installPerformanceMonitor() {
  window.addEventListener('load', () => {
    // 等 load 事件结束后再采集，确保 navigation / paint 条目已就绪
    setTimeout(() => {
      const nav = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined
      const fcp = performance
        .getEntriesByType('paint')
        .find((entry) => entry.name === 'first-contentful-paint')?.startTime

      const payload = {
        fcp,
        ttfb: nav ? nav.responseStart - nav.requestStart : undefined,
        domInteractive: nav?.domInteractive,
      }

      void apiRequest('/api/log/performance', {
        method: 'POST',
        body: JSON.stringify(payload),
      }).catch(() => undefined)
    }, 0)
  })
}