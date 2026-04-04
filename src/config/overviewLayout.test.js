import { describe, expect, it } from 'vitest'
import {
  DEFAULT_OVERVIEW_METRIC_SLOTS,
  buildOverviewWidgetLayout,
  DEFAULT_OVERVIEW_WIDGET_SLOTS,
  getWidgetOptionState,
  normalizeOverviewWidgetSlots,
} from './overviewLayout'

describe('default overview slots', () => {
  it('uses the operator-first KPI order', () => {
    expect(DEFAULT_OVERVIEW_METRIC_SLOTS).toEqual([
      'activeConversations',
      'needsAttention',
      'bookingIntent',
      'confirmedCalls',
      'atRiskBookings',
      'qualifiedLeads',
      'showRate',
      'avgReplyQuality',
    ])
  })

  it('starts the homepage with the two trend charts', () => {
    expect(DEFAULT_OVERVIEW_WIDGET_SLOTS).toEqual([
      'leadTrend',
      'bookingTrend',
      'funnel',
      'qualificationBreakdown',
      'needsAttention',
      'upcomingCalls',
      'topIssues',
      'objectionDistribution',
    ])
  })
})

describe('normalizeOverviewWidgetSlots', () => {
  it('restores a unique canonical widget order when duplicates are present', () => {
    const normalized = normalizeOverviewWidgetSlots([
      'funnel',
      'bookingTrend',
      'bookingTrend',
      'bookingTrend',
    ])

    expect(new Set(normalized).size).toBe(DEFAULT_OVERVIEW_WIDGET_SLOTS.length)
    expect(normalized).toContain('leadTrend')
    expect(normalized[0]).toBe('funnel')
  })
})

describe('getWidgetOptionState', () => {
  it('disables widgets already selected in other slots', () => {
    const options = getWidgetOptionState(DEFAULT_OVERVIEW_WIDGET_SLOTS, 1)

    expect(options.find((option) => option.value === 'funnel')?.disabled).toBe(true)
    expect(options.find((option) => option.value === 'bookingTrend')?.disabled).toBe(false)
  })
})

describe('buildOverviewWidgetLayout', () => {
  it('fills each row without leaving dead grid gaps', () => {
    const layout = buildOverviewWidgetLayout(DEFAULT_OVERVIEW_WIDGET_SLOTS)
    const rowTotals = []
    let currentRow = 0

    layout.forEach((item) => {
      currentRow += item.span

      if (currentRow === 12) {
        rowTotals.push(currentRow)
        currentRow = 0
      }
    })

    expect(rowTotals).toEqual([12, 12, 12, 12])
  })
})
