<script setup lang="ts">
import { computed } from 'vue'

type Status = 'paid' | 'refunded' | 'completed'

const props = defineProps<{ status: Status }>()

const STATUS_TEXT: Record<Status, string> = {
  paid: '已支付',
  refunded: '已退款',
  completed: '已完成',
}

const label = computed(() => STATUS_TEXT[props.status])
</script>

<template>
  <span class="payment-status" :class="status">
    <i />{{ label }}
  </span>
</template>