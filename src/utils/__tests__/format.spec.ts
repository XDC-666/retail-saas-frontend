import { describe, expect, it } from 'vitest'
import { shortDate } from '@/utils/format'

describe('shortDate', () => {
  it('formats ISO dates for chart axes', () => {
    expect(shortDate('2026-09-12')).toBe('09/12')
  })
})
