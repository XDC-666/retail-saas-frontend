<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { usePlatform } from '@/composables/usePlatform'
import AppIcon from '@/components/common/AppIcon.vue'
import { useI18n } from 'vue-i18n'; import { setLocale } from '@/locales'

const auth = useAuthStore()
const theme = useThemeStore()
const router = useRouter()
const route = useRoute()
const { isElectron, desktopInfo } = usePlatform()
const { t, locale } = useI18n()

const pageTitle = computed(() => String(route.meta.title || 'RetailOps'))

async function changeTenant(event: Event) {
  await auth.switchTenant((event.target as HTMLSelectElement).value)
}

async function logout() {
  await auth.logout()
  await router.replace('/login')
}
function changeLocale(e:Event){setLocale((e.target as HTMLSelectElement).value as 'zh-CN'|'en-US')}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand-row">
        <div class="brand-mark">R</div>
        <div>
          <div class="brand">RetailOps</div>
          <div class="brand-subtitle">Retail SaaS Console</div>
        </div>
      </div>

      <div class="tenant-box">
        <span class="sidebar-label">当前租户</span>
        <select class="tenant-select" :value="auth.activeTenantId" data-testid="tenant-select" @change="changeTenant">
          <option v-for="tenant in auth.tenantOptions" :key="tenant.id" :value="tenant.id">
            {{ tenant.name }} · {{ tenant.plan }}
          </option>
        </select>
      </div>

      <nav class="nav" aria-label="主导航">
        <RouterLink v-for="item in auth.navigation" :key="item.code" :to="item.path" class="nav__item">
          <AppIcon :name="item.icon" />
          <span>{{ t(`nav.${item.code}`) }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar__footer">
        <div v-if="isElectron" class="desktop-chip">Desktop v{{ desktopInfo?.version || '...' }}</div>
        <button class="sidebar-action" type="button" @click="logout">
          <AppIcon name="logout" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <main class="main-panel">
      <header class="topbar">
        <div>
          <div class="topbar__eyebrow">{{ auth.activeTenant?.name }}</div>
          <h2 class="topbar__title">{{ pageTitle }}</h2>
        </div>
        <div class="topbar__actions">
          <select class="language-select" :value="locale" @change="changeLocale"><option value="zh-CN">中文</option><option value="en-US">English</option></select>
          <button class="icon-button" type="button" data-testid="theme-toggle" :aria-label="theme.isDark ? '切换浅色主题' : '切换深色主题'" @click="theme.toggle">
            <AppIcon :name="theme.isDark ? 'sun' : 'moon'" />
          </button>
          <div class="user-block">
            <div class="avatar">{{ auth.user?.name?.slice(0, 1) }}</div>
            <div>
              <div class="user-block__name">{{ auth.user?.name }}</div>
              <div class="user-block__role text-xs op-80">{{ auth.user?.roleLabel }}</div>
            </div>
          </div>
        </div>
      </header>
      <section class="content"><RouterView /></section>
    </main>
  </div>
</template>
