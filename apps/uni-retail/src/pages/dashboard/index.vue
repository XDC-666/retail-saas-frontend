<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { request } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { getPlatformLabel } from '@/utils/platform'

const auth = useAuthStore()
const data = ref<any>(null)
const money = (value: number) => `¥${Math.round(value).toLocaleString()}`
const platform = getPlatformLabel()
const metrics = computed(() => data.value?.metrics)

async function load() {
  if (!auth.activeTenantId) await auth.restore()
  if (!auth.isAuthenticated) return uni.reLaunch({ url: '/pages/login/index' })
  data.value = await request(`/dashboard?tenantId=${auth.activeTenantId}`)
}
onMounted(load)
</script>

<template>
  <view>
    <view class="card welcome"><view><text class="muted">{{ platform }}</text><text class="headline">{{ auth.user?.name }}，经营概览</text></view><text class="role">{{ auth.user?.roleLabel }}</text></view>
    <view v-if="metrics" class="metric-grid">
      <view class="metric"><text>近 7 日销售</text><strong>{{ money(metrics.totalSales) }}</strong><small>↑ {{ (metrics.salesChange * 100).toFixed(1) }}%</small></view>
      <view class="metric"><text>订单数</text><strong>{{ metrics.totalOrders.toLocaleString() }}</strong><small>↑ {{ (metrics.ordersChange * 100).toFixed(1) }}%</small></view>
      <view class="metric"><text>客单价</text><strong>{{ money(metrics.avgOrderValue) }}</strong><small>多渠道汇总</small></view>
      <view class="metric"><text>退款率</text><strong>{{ (metrics.avgRefundRate * 100).toFixed(1) }}%</strong><small>风险监控</small></view>
    </view>
    <view class="card"><text class="section-title">门店销售排行</text><view v-for="(row,index) in data?.ranking" :key="row.storeId" class="rank"><text>{{ index + 1 }}. {{ row.storeName }}</text><strong>{{ money(row.amount) }}</strong></view></view>
  </view>
</template>

<style scoped lang="scss">
.welcome { display:flex; justify-content:space-between; align-items:center; }
.headline { display:block; margin-top:8rpx; font-size:34rpx; font-weight:800; }
.role { padding:10rpx 16rpx; border-radius:999rpx; color:#4f46e5; background:#eef2ff; font-size:20rpx; }
.metric-grid { padding: 0 24rpx; display:grid; grid-template-columns:1fr 1fr; gap:18rpx; }
.metric { padding:28rpx; display:flex; flex-direction:column; gap:12rpx; border-radius:24rpx; background:#fff; box-shadow:0 10rpx 30rpx rgba(15,23,42,.04); }
.metric text,.metric small { color:#718096; font-size:22rpx; }.metric strong{font-size:34rpx}.metric small{color:#059669}
.section-title{font-size:28rpx;font-weight:800}.rank{padding:24rpx 0;display:flex;justify-content:space-between;border-bottom:1px solid #edf1f5;font-size:24rpx}.rank:last-child{border-bottom:0}
</style>
