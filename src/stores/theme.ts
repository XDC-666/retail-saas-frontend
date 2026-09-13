import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('light')
  const isDark = computed(() => mode.value === 'dark')

  function apply(next: ThemeMode) {
    mode.value = next
    document.documentElement.dataset.theme = next
    localStorage.setItem('retailops:theme', next)
  }

  function init() {
    const saved = localStorage.getItem('retailops:theme') as ThemeMode | null
    const preferred = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    apply(saved === 'dark' || saved === 'light' ? saved : preferred)
  }

  function toggle() {
    apply(isDark.value ? 'light' : 'dark')
  }

  return { mode, isDark, init, toggle, apply }
})
