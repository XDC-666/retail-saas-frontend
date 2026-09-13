import type { Directive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { Permission } from '@/types/domain'

function applyPermission(el: HTMLElement, value?: Permission | Permission[]) {
  const auth = useAuthStore()
  el.style.display = auth.can(value) ? '' : 'none'
}

export const permissionDirective: Directive<HTMLElement, Permission | Permission[]> = {
  mounted(el, binding) { applyPermission(el, binding.value) },
  updated(el, binding) { applyPermission(el, binding.value) },
}
