<script setup lang="ts">
defineProps<{ name: 'chart' | 'receipt' | 'store' | 'shield' | 'sun' | 'moon' | 'logout' | 'search' | 'download' }>()
</script>

<template>
  <svg v-if="name === 'chart'" viewBox="0 0 24 24" class="app-icon"><path d="M4 19V9m6 10V5m6 14v-7m4 7H2" /></svg>
  <svg v-else-if="name === 'receipt'" viewBox="0 0 24 24" class="app-icon"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6" /></svg>
  <svg v-else-if="name === 'store'" viewBox="0 0 24 24" class="app-icon"><path d="M4 10v10h16V10M3 10l2-6h14l2 6M8 20v-6h8v6M3 10c1 2 4 2 5 0 1 2 4 2 5 0 1 2 4 2 5 0 1 2 3 2 3 0" /></svg>
  <svg v-else-if="name === 'shield'" viewBox="0 0 24 24" class="app-icon"><path d="M12 3 4 6v5c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V6l-8-3Z"/></svg>
  <svg v-else-if="name === 'sun'" viewBox="0 0 24 24" class="app-icon"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
  <svg v-else-if="name === 'moon'" viewBox="0 0 24 24" class="app-icon"><path d="M20 15.4A8.5 8.5 0 0 1 8.6 4 8.5 8.5 0 1 0 20 15.4Z" /></svg>
  <svg v-else-if="name === 'logout'" viewBox="0 0 24 24" class="app-icon"><path d="M10 4H5v16h5m4-4 4-4-4-4m4 4H9" /></svg>
  <svg v-else-if="name === 'search'" viewBox="0 0 24 24" class="app-icon"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4" /></svg>
  <svg v-else viewBox="0 0 24 24" class="app-icon"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14" /></svg>
</template>
