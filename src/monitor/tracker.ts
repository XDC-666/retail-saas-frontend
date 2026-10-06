import { apiRequest } from '@/api/client'

type EventData = Record<string, string | number | boolean | undefined>

/**
 * 埋点上报。监控本身不能影响业务，所有失败都静默吞掉。
 */
export function track(event: string, data: EventData = {}) {
  void apiRequest('/api/log/event', {
    method: 'POST',
    body: JSON.stringify({
      event,
      data,
      path: location.pathname + location.hash,
      time: new Date().toISOString(),
    }),
  }).catch(() => undefined)
}