import { computed, onMounted, ref } from 'vue'

export function usePlatform() {
  const desktopInfo = ref<{ version: string; platform: string } | null>(null)
  const isElectron = computed(() => Boolean(window.retailDesktop))
  const isTouch = computed(() => window.matchMedia?.('(pointer: coarse)').matches ?? false)

  onMounted(async () => {
    if (window.retailDesktop) desktopInfo.value = await window.retailDesktop.getAppInfo()
  })

  return { isElectron, isTouch, desktopInfo }
}
