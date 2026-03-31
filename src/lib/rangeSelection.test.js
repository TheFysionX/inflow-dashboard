import { describe, expect, it } from 'vitest'
import {
  buildCustomRangeSelection,
  buildPresetRangeSelection,
  getRangeSelectionBounds,
  getRangeSelectionKey,
  normalizeRangeSelection,
} from './rangeSelection'

describe('buildCustomRangeSelection', () => {
  it('normalizes date order and creates a human-readable label', () => {
    const selection = buildCustomRangeSelection(
      new Date('2026-03-30T00:00:00'),
      new Date('2026-03-01T00:00:00'),
    )

    expect(selection.mode).toBe('custom')
    expect(selection.startDate).toBe('2026-03-01')
    expect(selection.endDate).toBe('2026-03-30')
    expect(selection.label).toContain('Mar')
  })
})

describe('normalizeRangeSelection', () => {
  it('supports legacy preset strings and custom objects', () => {
    expect(normalizeRangeSelection('3M')).toEqual(buildPresetRangeSelection('3M'))

    const custom = normalizeRangeSelection({
      mode: 'custom',
      preset: 'custom',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
    })

    expect(custom.mode).toBe('custom')
    expect(getRangeSelectionKey(custom)).toBe('custom:2026-02-01:2026-02-28')
    expect(getRangeSelectionBounds(custom)?.start.toISOString()).toContain('2026-02-01')
  })
})
