interface UniStorageLike {
  getStorageSync: (key: string) => unknown
  setStorageSync: (key: string, value: string) => void
  removeStorageSync: (key: string) => void
}

function getUniRuntime(): UniStorageLike | undefined {
  return (globalThis as typeof globalThis & { uni?: UniStorageLike }).uni
}

function getDesktopRuntime() {
  return typeof window !== 'undefined' ? window.retailDesktop : undefined
}

const prefix = 'retailops:'

export const storage = {
  async get(key: string) {
    const fullKey = prefix + key
    const desktop = getDesktopRuntime()
    if (desktop) return desktop.storageGet(fullKey)

    const uni = getUniRuntime()
    if (uni) {
      const value = uni.getStorageSync(fullKey)
      return typeof value === 'string' ? value : null
    }

    return typeof localStorage !== 'undefined' ? localStorage.getItem(fullKey) : null
  },

  async set(key: string, value: string) {
    const fullKey = prefix + key
    const desktop = getDesktopRuntime()
    if (desktop) return desktop.storageSet(fullKey, value)

    const uni = getUniRuntime()
    if (uni) return uni.setStorageSync(fullKey, value)

    if (typeof localStorage !== 'undefined') localStorage.setItem(fullKey, value)
  },

  async remove(key: string) {
    const fullKey = prefix + key
    const desktop = getDesktopRuntime()
    if (desktop) return desktop.storageRemove(fullKey)

    const uni = getUniRuntime()
    if (uni) return uni.removeStorageSync(fullKey)

    if (typeof localStorage !== 'undefined') localStorage.removeItem(fullKey)
  },
}
