<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
const props = defineProps<{ open: boolean; title: string; width?: string }>()
const emit = defineEmits<{ close: [] }>()
function keydown(e: KeyboardEvent) { if (e.key === 'Escape') emit('close') }
watch(() => props.open, (open) => { document.body.style.overflow = open ? 'hidden' : ''; open ? window.addEventListener('keydown', keydown) : window.removeEventListener('keydown', keydown) }, { immediate: true })
onBeforeUnmount(() => { document.body.style.overflow = ''; window.removeEventListener('keydown', keydown) })
</script>
<template><Teleport to="body"><Transition name="drawer"><div v-if="open" class="drawer-layer" role="dialog" aria-modal="true"><button class="drawer-mask" aria-label="关闭" @click="$emit('close')"/><aside class="drawer-panel" :style="{ width: width || '520px' }"><header><div><small>RETAILOPS</small><h2>{{ title }}</h2></div><button class="drawer-close" aria-label="关闭" @click="$emit('close')">×</button></header><div class="drawer-body"><slot /></div><footer v-if="$slots.footer"><slot name="footer" /></footer></aside></div></Transition></Teleport></template>
