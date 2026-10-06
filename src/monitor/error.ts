import { apiRequest } from '@/api/client'

/** 上报失败不影响主流程，静默忽略 */
function report(payload: object) {
  void apiRequest('/api/log/error', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      url: location.href,
      time: new Date().toISOString(),
    }),
  }).catch(() => undefined)
}

export function installErrorMonitor() {
  window.addEventListener('error', (event) => {
    report({
      type: 'js_error',
      message: event.message,
      source: event.filename,
      line: event.lineno,
      stack: event.error?.stack,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    report({
      type: 'unhandled_rejection',
      message: String(event.reason?.message || event.reason),
      stack: event.reason?.stack,
    })
  })
}