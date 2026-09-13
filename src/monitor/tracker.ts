import { apiRequest } from '@/api/client'
type EventData = Record<string, string | number | boolean | undefined>
export function track(event: string, data: EventData = {}) { void apiRequest('/api/log/event', { method: 'POST', body: JSON.stringify({ event, data, path: location.pathname + location.hash, time: new Date().toISOString() }) }).catch(() => undefined) }
