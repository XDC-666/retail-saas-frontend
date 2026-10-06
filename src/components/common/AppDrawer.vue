<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

const props = withDefaults(defineProps<{ open: boolean; title: string; width?: string }>(), {
  width: '520px',
})
const emit = defineEmits<{ close: [] }>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

function close() {
  emit('close')
}

// 抽屉打开时锁住页面滚动，并支持 Esc 关闭
watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      window.addEventListener('keydown', onKeydown)
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="drawer-layer" role="dialog" aria-modal="true">
        <button class="drawer-mask" aria-label="关闭" @click="close" />
        <aside class="drawer-panel" :style="{ width }">
          <header>
            <div>
              <small>RETAILOPS</small>
              <h2>{{ title }}</h2>
            </div>
            <button class="drawer-close" aria-label="关闭" @click="close">×</button>
          </header>
          <div class="drawer-body">
            <slot />
          </div>
          <footer v-if="$slots.footer">
            <slot name="footer" />
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>