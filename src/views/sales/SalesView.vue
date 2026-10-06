<script setup lang="ts">
import { ref, watch } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import VirtualTable from '@/components/VirtualTable.vue'
import OrderDrawer from '@/views/orders/OrderDrawer.vue'
import { useAuthStore } from '@/stores/auth'
import { useSalesStore } from '@/stores/sales'
import { fetchLargeSales } from '@/api/retail'
import { track } from '@/monitor/tracker'
import { exportSalesCsv } from '@/utils/exportCsv'
import { money, percent } from '@/utils/format'
import type { SaleRecord } from '@/types/domain'

const auth = useAuthStore()
const sales = useSalesStore()

const channels = ['线下门店', '微信小程序', '外卖平台'] as const

const orderId = ref<string | null>(null)
const largeMode = ref(false)
const largeLoading = ref(false)
const largeRows = ref<SaleRecord[]>([])

function openOrder(id: string) {
  orderId.value = id
  track('order_detail_opened', { orderId: id })
}

/** 虚拟列表没有真实订单 id，退回到当前分页的首条记录 */
function openFirstOrder() {
  const first = sales.records[0]
  if (first) openOrder(first.id)
}

async function initialize(tenantId: string, token: string) {
  await Promise.all([sales.loadStores(tenantId, token), sales.load(tenantId, token, true)])
}

async function search() {
  if (auth.token) await sales.load(auth.activeTenantId, auth.token, true)
}

async function reset() {
  sales.resetFilters()
  await search()
}

async function changePage(page: number) {
  if (!auth.token) return
  sales.query.page = page
  await sales.load(auth.activeTenantId, auth.token)
}

/** 虚拟列表按需拉取 10 万条数据，已加载过则直接复用 */
async function toggleLargeMode() {
  largeMode.value = true
  if (largeRows.value.length || largeLoading.value || !auth.token) return

  largeLoading.value = true
  try {
    const data = await fetchLargeSales(auth.activeTenantId, auth.token)
    largeRows.value = data.items
  } finally {
    largeLoading.value = false
  }
}

function closeOrder() {
  orderId.value = null
}

watch(
  () => [auth.activeTenantId, auth.token] as const,
  ([tenantId, token]) => {
    if (tenantId && token) initialize(tenantId, token)
  },
  { immediate: true },
)
</script>

<template>
  <div class="page-stack">
    <div class="page-heading">
      <div>
        <span class="page-kicker">TRANSACTIONS</span>
        <h1 class="page-title">销售明细</h1>
        <p>服务端筛选与分页 · 支持门店、渠道、日期范围组合查询</p>
      </div>
      <button
        v-permission="'sales:export'"
        class="btn-secondary"
        type="button"
        @click="track('export_sales'); exportSalesCsv(sales.records)"
      >
        <AppIcon name="download" />
        导出当前页 CSV
      </button>
    </div>

    <section class="card filter-card">
      <div class="filter-grid">
        <label class="field field--search">
          <span>关键词</span>
          <div class="input-with-icon">
            <AppIcon name="search" />
            <input v-model="sales.query.keyword" placeholder="门店 / 城市 / 渠道" @keyup.enter="search" />
          </div>
        </label>
        <label class="field">
          <span>门店</span>
          <select v-model="sales.query.storeId" data-testid="filter-store">
            <option value="">全部门店</option>
            <option v-for="store in sales.stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </label>
        <label class="field">
          <span>渠道</span>
          <select v-model="sales.query.channel" data-testid="filter-channel">
            <option value="">全部渠道</option>
            <option v-for="channel in channels" :key="channel" :value="channel">
              {{ channel }}
            </option>
          </select>
        </label>
        <label class="field">
          <span>开始日期</span>
          <input v-model="sales.query.from" type="date" />
        </label>
        <label class="field">
          <span>结束日期</span>
          <input v-model="sales.query.to" type="date" />
        </label>
        <div class="filter-actions">
          <button class="btn-primary" type="button" @click="search">查询</button>
          <button class="btn-ghost" type="button" @click="reset">重置</button>
        </div>
      </div>
    </section>

    <section class="card table-card">
      <div class="table-card__head">
        <div>
          <strong>销售记录</strong>
          <span>共 {{ sales.total }} 条匹配结果</span>
        </div>
        <div class="view-switch">
          <button :class="{ 'is-active': !largeMode }" @click="largeMode = false">分页</button>
          <button :class="{ 'is-active': largeMode }" @click="toggleLargeMode">10 万条虚拟列表</button>
        </div>
      </div>

      <template v-if="!largeMode">
        <div class="table-scroll">
          <table class="data-table" data-testid="sales-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>门店</th>
                <th>城市</th>
                <th>渠道</th>
                <th>销售额</th>
                <th>订单数</th>
                <th>退款率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sales.loading">
                <td colspan="7" class="table-state">正在加载销售数据…</td>
              </tr>
              <tr v-else-if="!sales.records.length">
                <td colspan="7" class="table-state">暂无匹配数据</td>
              </tr>
              <template v-else>
                <tr
                  v-for="row in sales.records"
                  :key="row.id"
                  class="clickable-row"
                  @click="openOrder(row.id)"
                >
                  <td>{{ row.date }}</td>
                  <td><strong>{{ row.storeName }}</strong></td>
                  <td>{{ row.city }}</td>
                  <td><span class="channel-chip">{{ row.channel }}</span></td>
                  <td class="numeric strong">{{ money.format(row.amount) }}</td>
                  <td class="numeric">{{ row.orders.toLocaleString() }}</td>
                  <td>
                    <span :class="row.refundRate > 0.02 ? 'text-warning' : 'text-success'">
                      {{ percent.format(row.refundRate) }}
                    </span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <PaginationBar
          :page="sales.query.page"
          :page-size="sales.query.pageSize"
          :total="sales.total"
          @change="changePage"
        />
      </template>

      <template v-else>
        <div v-if="largeLoading" class="table-state">正在生成 100,000 条记录…</div>
        <VirtualTable v-else :items="largeRows">
          <template #default="{ item: row, index }">
            <!-- 虚拟列表的 id 是 mock 合成的 large-N，不存在于订单接口，
                 因此沿用当前分页首条记录作为详情入口 -->
            <button class="virtual-sale-row" @click="openFirstOrder">
              <span>#{{ index + 1 }}</span>
              <strong>{{ row.storeName }}</strong>
              <span>{{ row.channel }}</span>
              <b>{{ money.format(row.amount) }}</b>
            </button>
          </template>
        </VirtualTable>
      </template>
    </section>

    <OrderDrawer :open="Boolean(orderId)" :order-id="orderId" :token="auth.token" @close="closeOrder" />
  </div>
</template>