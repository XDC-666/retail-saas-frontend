<script setup lang="ts">
defineProps<{
  label: string
  value: string
  change?: number
  hint?: string
  tone?: 'blue' | 'green' | 'violet' | 'amber'
}>()
</script>

<template>
  <article class="metric-card" :data-tone="tone || 'blue'">
    <div class="metric-card__head">
      <span>{{ label }}</span>
      <span class="metric-card__dot" />
    </div>
    <div class="metric-card__value">{{ value }}</div>
    <div class="metric-card__foot">
      <span v-if="change !== undefined" class="metric-change" :class="change >= 0 ? 'is-positive' : 'is-negative'">
        {{ change >= 0 ? '↑' : '↓' }} {{ Math.abs(change * 100).toFixed(1) }}%
      </span>
      <span>{{ hint || '较上一周期' }}</span>
    </div>
  </article>
</template>
