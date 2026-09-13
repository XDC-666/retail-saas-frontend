export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code = 'API_ERROR',
  ) {
    super(message)
  }
}

const configuredBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${configuredBase}${path}`, { ...options, headers })
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(body?.message || '请求失败，请稍后重试', response.status, body?.code)
  }

  return body as T
}
