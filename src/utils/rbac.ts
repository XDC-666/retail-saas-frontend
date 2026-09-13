import type { Permission } from '@/types/domain'

export function hasPermission(granted: readonly Permission[], required?: Permission | Permission[]) {
  if (!required) return true
  const requiredList = Array.isArray(required) ? required : [required]
  return requiredList.every((permission) => granted.includes(permission))
}
