<script setup lang="ts">
import { computed, watch } from 'vue'
import MetricCard from '@/components/MetricCard.vue'
import SalesTrendChart from '@/components/charts/SalesTrendChart.vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { useThemeStore } from '@/stores/theme'
import { money, number, percent } from '@/utils/format'

const auth = useAuthStore()
const dashboard = useDashboardStore()
const theme = useThemeStore()

const metrics = computed(() => dashboard.data?.metrics)
const maxRanking = computed(() => Math.max(...(dashboard.data?.ranking.map((item) => item.amount) || [1])))

watch(
  () => [auth.activeTenantId, auth.token] as const,
  ([tenantId, token]) => {
    if (tenantId && token) dashboard.load(tenantId, token)
  },
  { immediate: true },
)
</script>

<template>
  <div class="page-stack">
    <div class="page-heading">
      <div>
        <span class="page-kicker">OVERVIEW</span>
        <h1 class="page-title">经营数据总览</h1>
        <p>近 7 日核心经营指标 · 数据已按租户隔离</p>
      </div>
      <div class="live-chip whitespace-nowrap"><span /> Mock API 实时数据</div>
    </div>

    <div v-if="metrics" class="metric-grid">
      <MetricCard label="销售额" :value="money.format(metrics.totalSales)" :change="metrics.salesChange" tone="blue" />
      <MetricCard label="订单数" :value="number.format(metrics.totalOrders)" :change="metrics.ordersChange" tone="green" />
      <MetricCard label="客单价" :value="money.format(metrics.avgOrderValue)" :change="metrics.aovChange" tone="violet" />
      <MetricCard label="平均退款率" :value="percent.format(metrics.avgRefundRate)" :change="metrics.refundChange" tone="amber" />
    </div>
    <div v-else class="metric-grid">
      <div v-for="n in 4" :key="n" class="skeleton metric-skeleton" />
    </div>

    <div class="dashboard-grid">
      <section class="card panel-card trend-panel">
        <div class="panel-head">
          <div><h2>销售趋势</h2><p>销售额与订单数双轴趋势</p></div>
          <span class="panel-period">近 7 天</span>
        </div>
        <SalesTrendChart v-if="dashboard.data" :data="dashboard.data.trend" :dark="theme.isDark" />
        <div v-else class="skeleton chart-skeleton" />
      </section>

      <section class="card panel-card ranking-panel">
        <div class="panel-head">
          <div><h2>门店排行</h2><p>按近 7 日销售额排序</p></div>
        </div>
        <div class="ranking-list">
          <div v-for="(item, index) in dashboard.data?.ranking" :key="item.storeId" class="ranking-row">
            <span class="rank-index" :class="{ 'is-top': index < 3 }">{{ index + 1 }}</span>
            <div class="ranking-row__main">
              <div class="ranking-row__label"><strong>{{ item.storeName }}</strong><span>{{ item.city }}</span></div>
              <div class="progress-track"><span :style="{ width: `${Math.round(item.amount / maxRanking * 100)}%` }" /></div>
            </div>
            <div class="ranking-row__value">{{ money.format(item.amount) }}</div>
          </div>
        </div>
      </section>
    </div>

    <section class="card architecture-strip min-w-0">
      <div><span class="architecture-strip__label">Architecture</span><strong>服务端驱动 RBAC</strong><small>动态菜单 + 动态路由 + 按钮权限</small></div>
      <div><strong>多租户数据隔离</strong><small>tenantId 贯穿 API 与 Store</small></div>
      <div><strong>跨端存储适配</strong><small>Web · Electron IPC · Uni-App</small></div>
      <div><strong>测试保障</strong><small>Vitest + Playwright + GitHub Actions</small></div>
    </section>
  </div>
</template>
