<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { request } from '@/api/client'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const rows = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const loading = ref(false)

async function load(reset = false) {
  if (loading.value) return
  loading.value = true
  if (reset) { page.value = 1; rows.value = [] }
  try {
    const data = await request<any>(`/sales?tenantId=${auth.activeTenantId}&page=${page.value}&pageSize=12`)
    rows.value.push(...data.items); total.value = data.total
    if (rows.value.length < total.value) page.value += 1
  } finally { loading.value = false; uni.stopPullDownRefresh() }
}

onMounted(async () => { if (!auth.activeTenantId) await auth.restore(); await load(true) })
onPullDownRefresh(() => load(true))
onReachBottom(() => { if (rows.value.length < total.value) load() })
</script>

<template>
  <view class="sales-page">
    <view class="summary"><text>销售明细</text><text class="muted">{{ rows.length }} / {{ total }}</text></view>
    <view v-for="row in rows" :key="row.id" class="sale-row">
      <view><strong>{{ row.storeName }}</strong><text>{{ row.date }} · {{ row.channel }}</text></view>
      <view class="amount"><strong>¥{{ row.amount.toLocaleString() }}</strong><text>{{ row.orders }} 单</text></view>
    </view>
    <view class="loading muted">{{ loading ? '加载中…' : rows.length >= total ? '已经到底了' : '上拉加载更多' }}</view>
  </view>
</template>

<style scoped lang="scss">
.sales-page{padding:24rpx}.summary{padding:16rpx 8rpx 28rpx;display:flex;justify-content:space-between;font-size:30rpx;font-weight:800}.sale-row{margin-bottom:16rpx;padding:26rpx;display:flex;justify-content:space-between;align-items:center;border-radius:24rpx;background:white}.sale-row view{display:flex;flex-direction:column;gap:9rpx}.sale-row text{font-size:21rpx;color:#718096}.amount{text-align:right}.amount strong{color:#4f46e5}.loading{padding:28rpx;text-align:center;font-size:22rpx}
</style>
