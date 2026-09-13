import { apiRequest } from '@/api/client'
export function installErrorMonitor() {
  const report = (payload: object) => void apiRequest('/api/log/error', { method: 'POST', body: JSON.stringify({ ...payload, url: location.href, time: new Date().toISOString() }) }).catch(() => undefined)
  window.addEventListener('error', (e) => report({ type: 'js_error', message: e.message, source: e.filename, line: e.lineno, stack: e.error?.stack }))
  window.addEventListener('unhandledrejection', (e) => report({ type: 'unhandled_rejection', message: String(e.reason?.message || e.reason), stack: e.reason?.stack }))
}
