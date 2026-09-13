<script setup lang="ts">import type { OrderEvent } from '@/types/domain'; defineProps<{ items: OrderEvent[] }>()</script>
<template><ol class="timeline"><li v-for="item in items" :key="item.id" :class="item.status"><i/><div><strong>{{ item.label }}</strong><p>{{ item.detail }}</p><time>{{ item.time }}</time></div></li></ol></template>
