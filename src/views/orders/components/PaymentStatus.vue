<script setup lang="ts">defineProps<{ status: 'paid' | 'refunded' | 'completed' }>()</script>
<template><span class="payment-status" :class="status"><i/>{{ status === 'refunded' ? '已退款' : status === 'completed' ? '已完成' : '已支付' }}</span></template>
