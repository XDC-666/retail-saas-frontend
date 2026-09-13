<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const email = ref('owner@demo.local')
const password = ref('123456')
const loading = ref(false)
const error = ref('')

const accounts = [
  { email: 'owner@demo.local', label: '超级管理员', desc: '全部页面 + 导出 + 门店管理', badge: 'Owner' },
  { email: 'manager@demo.local', label: '区域经理', desc: '看板 + 销售 + 导出 + 门店只读', badge: 'Manager' },
  { email: 'clerk@demo.local', label: '门店员工', desc: '看板 + 销售，只读权限', badge: 'Clerk' },
]

const activeAccount = computed(() => accounts.find((item) => item.email === email.value))

function selectAccount(accountEmail: string) {
  email.value = accountEmail
  password.value = '123456'
  error.value = ''
}

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login({ email: email.value, password: password.value })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <section class="login-hero">
      <div class="login-hero__top">
        <div class="brand-row is-light">
          <div class="brand-mark">R</div>
          <div>
            <div class="brand">RetailOps</div>
            <div class="brand-subtitle">Multi-tenant Retail SaaS</div>
          </div>
        </div>
        <span class="demo-badge">INTERVIEW DEMO</span>
      </div>
      <div class="login-hero__copy">
        <p class="hero-kicker uppercase tracking-widest">Vue 3 · TypeScript · Electron · Uni-App</p>
        <h1>用一套项目，展示真实业务级前端工程能力。</h1>
        <p>多租户隔离、服务端驱动 RBAC、ECharts 数据看板、真实 Mock API、暗黑主题与多端适配全部集中在一个可运行仓库中。</p>
        <div class="hero-feature-grid">
          <div><strong>3</strong><span>RBAC 角色</span></div>
          <div><strong>2</strong><span>租户空间</span></div>
          <div><strong>3</strong><span>运行端形态</span></div>
          <div><strong>100%</strong><span>TypeScript</span></div>
        </div>
      </div>
      <div class="login-hero__footer">Designed for a retail SaaS interview portfolio · v2.0</div>
    </section>

    <main class="login-panel">
      <div class="login-card">
        <div class="login-card__head">
          <span class="login-icon">→</span>
          <div>
            <h2>欢迎回来</h2>
            <p>选择演示角色，观察菜单、路由和按钮权限如何变化。</p>
          </div>
        </div>

        <div class="demo-account-list">
          <button v-for="account in accounts" :key="account.email" type="button" class="demo-account" :class="{ 'is-active': email === account.email }" @click="selectAccount(account.email)">
            <span class="role-avatar">{{ account.label.slice(0, 1) }}</span>
            <span class="demo-account__copy"><strong>{{ account.label }}</strong><small>{{ account.desc }}</small></span>
            <span class="role-badge">{{ account.badge }}</span>
          </button>
        </div>

        <form class="login-form" @submit.prevent="submit">
          <label class="field">
            <span>账号</span>
            <input v-model="email" type="email" autocomplete="username" data-testid="email" />
          </label>
          <label class="field">
            <span>密码</span>
            <input v-model="password" type="password" autocomplete="current-password" data-testid="password" />
          </label>
          <div v-if="error" class="form-error" role="alert">{{ error }}</div>
          <button class="btn-primary btn-lg" type="submit" :disabled="loading" data-testid="login-submit">
            {{ loading ? '正在建立会话…' : `以${activeAccount?.label || '当前账号'}登录` }}
          </button>
        </form>

        <p class="login-hint">演示密码统一为 <code>123456</code>。数据由独立 Node Mock Server 提供。</p>
      </div>
    </main>
  </div>
</template>
