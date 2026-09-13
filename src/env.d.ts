/// <reference types="vite/client" />

import 'vue-router'
import type { Permission } from '@/types/domain'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    permission?: Permission
    title?: string
  }
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string
  }

  interface Window {
    retailDesktop?: {
      getAppInfo: () => Promise<{ version: string; platform: string }>
      storageGet: (key: string) => Promise<string | null>
      storageSet: (key: string, value: string) => Promise<void>
      storageRemove: (key: string) => Promise<void>
    }
  }
}

export {}
