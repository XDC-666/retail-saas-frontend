import { apiRequest } from './client'
import type { LoginPayload, LoginResponse, NavigationItem, SessionResponse } from '@/types/domain'

export function loginApi(payload: LoginPayload) {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logoutApi(token: string) {
  return apiRequest<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }, token)
}

export function sessionApi(token: string) {
  return apiRequest<SessionResponse>('/api/session', {}, token)
}

export function navigationApi(token: string) {
  return apiRequest<{ items: NavigationItem[] }>('/api/navigation', {}, token)
}
