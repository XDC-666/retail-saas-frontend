import { computed, onMounted, ref } from 'vue'

/** 探测当前运行端：Web / Electron 桌面端 */
export function usePlatform() {
  const desktopInfo = ref<{ version: string; platform: string } | null>(null)
  const isElectron = computed(() => Boolean(window.retailDesktop))

  onMounted(async () => {
    if (window.retailDesktop) desktopInfo.value = await window.retailDesktop.getAppInfo()
  })

  return { isElectron, desktopInfo }
}