const API_BASE = 'http://127.0.0.1:8787/api'

export function request<T>(path: string, options: UniApp.RequestOptions = {} as UniApp.RequestOptions): Promise<T> {
  const token = uni.getStorageSync('retailops:token') as string
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      url: `${API_BASE}${path}`,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.header || {}),
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data as T)
        else reject(new Error((res.data as { message?: string })?.message || '请求失败'))
      },
      fail: reject,
    })
  })
}
