<script setup lang="ts" generic="T extends { id: string }">
import { computed, ref } from 'vue'
const props = withDefaults(defineProps<{ items: T[]; rowHeight?: number; height?: number }>(), { rowHeight: 48, height: 520 })
const top = ref(0); const overscan = 8
const start = computed(() => Math.max(0, Math.floor(top.value / props.rowHeight) - overscan))
const count = computed(() => Math.ceil(props.height / props.rowHeight) + overscan * 2)
const visible = computed(() => props.items.slice(start.value, start.value + count.value))
</script>
<template><div class="virtual-table" :style="{ height: `${height}px` }" @scroll="top = ($event.target as HTMLElement).scrollTop"><div :style="{ height: `${items.length * rowHeight}px`, position: 'relative' }"><div :style="{ transform: `translateY(${start * rowHeight}px)` }"><div v-for="(item, index) in visible" :key="item.id" class="virtual-row" :style="{ height: `${rowHeight}px` }"><slot :item="item" :index="start + index" /></div></div></div></div></template>
