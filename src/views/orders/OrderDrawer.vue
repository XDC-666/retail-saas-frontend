<script setup lang="ts">
import { ref, watch } from 'vue'
import AppDrawer from '@/components/common/AppDrawer.vue'
import PaymentStatus from './components/PaymentStatus.vue'
import OrderTimeline from './components/OrderTimeline.vue'
import { fetchOrder } from '@/api/retail'
import { money } from '@/utils/format'
import type { OrderDetail } from '@/types/domain'

const props = defineProps<{ open: boolean; orderId: string | null; token: string | null }>()
const emit = defineEmits<{ close: [] }>()

const item = ref<OrderDetail>()
const loading = ref(false)
const error = ref('')

watch(
  () => [props.open, props.orderId] as const,
  async ([open, id]) => {
    if (!open || !id || !props.token) return
    loading.value = true
    error.value = ''
    try {
      item.value = (await fetchOrder(id, props.token)).item
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载失败'
    } finally {
      loading.value = false
    }
  },
)

function close() {
  emit('close')
}
</script>

<template>
  <AppDrawer :open="open" title="订单详情" width="560px" @close="close">
    <div v-if="loading" class="drawer-state">正在加载订单详情…</div>
    <div v-else-if="error" class="form-error">{{ error }}</div>

    <div v-else-if="item" class="order-detail">
      <div class="order-hero">
        <div>
          <span>订单编号</span>
          <strong>#{{ item.orderNo }}</strong>
          <small>{{ item.storeName }}</small>
        </div>
        <PaymentStatus :status="item.status" />
      </div>

      <section>
        <h3>客户信息</h3>
        <div class="detail-grid">
          <div>
            <span>客户</span>
            <strong>{{ item.customer.name }}</strong>
          </div>
          <div>
            <span>手机</span>
            <strong>{{ item.customer.phone }}</strong>
          </div>
          <div>
            <span>会员等级</span>
            <strong>{{ item.customer.memberLevel }}</strong>
          </div>
          <div>
            <span>支付方式</span>
            <strong>{{ item.paymentMethod }}</strong>
          </div>
        </div>
      </section>

      <section>
        <h3>商品明细</h3>
        <div v-for="product in item.items" :key="product.id" class="product-line">
          <div>
            <strong>{{ product.name }}</strong>
            <span>× {{ product.quantity }}</span>
          </div>
          <strong>{{ money.format(product.quantity * product.unitPrice) }}</strong>
        </div>
        <div class="amount-summary">
          <span>商品小计 <b>{{ money.format(item.subtotal) }}</b></span>
          <span>优惠 <b>-{{ money.format(item.discount) }}</b></span>
          <strong>实付 <b>{{ money.format(item.paidAmount) }}</b></strong>
        </div>
      </section>

      <section>
        <h3>操作日志</h3>
        <OrderTimeline :items="item.timeline" />
      </section>
    </div>
  </AppDrawer>
</template>