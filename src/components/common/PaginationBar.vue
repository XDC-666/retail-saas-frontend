<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ page: number; pageSize: number; total: number }>()
const emit = defineEmits<{ change: [page: number] }>()
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const from = computed(() => props.total ? (props.page - 1) * props.pageSize + 1 : 0)
const to = computed(() => Math.min(props.total, props.page * props.pageSize))
</script>

<template>
  <div class="pagination-bar">
    <span class="pagination-bar__summary">显示 {{ from }}-{{ to }}，共 {{ total }} 条</span>
    <div class="pagination-bar__actions">
      <button class="btn-ghost btn-sm" :disabled="page <= 1" @click="emit('change', page - 1)">上一页</button>
      <span class="page-pill">{{ page }} / {{ pageCount }}</span>
      <button class="btn-ghost btn-sm" :disabled="page >= pageCount" @click="emit('change', page + 1)">下一页</button>
    </div>
  </div>
</template>
