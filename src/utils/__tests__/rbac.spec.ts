import { describe, expect, it } from 'vitest'
import { hasPermission } from '@/utils/rbac'
import type { Permission } from '@/types/domain'

describe('hasPermission', () => {
  const granted: Permission[] = ['dashboard:view', 'sales:view', 'sales:export']

  it('accepts a granted permission', () => {
    expect(hasPermission(granted, 'sales:view')).toBe(true)
  })

  it('rejects a missing permission', () => {
    expect(hasPermission(granted, 'stores:manage')).toBe(false)
  })

  it('requires all permissions when an array is provided', () => {
    expect(hasPermission(granted, ['sales:view', 'sales:export'])).toBe(true)
    expect(hasPermission(granted, ['sales:view', 'stores:manage'])).toBe(false)
  })
})
