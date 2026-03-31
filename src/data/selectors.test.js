import { describe, expect, it } from 'vitest'
import { demoDataset } from './demoData'
import { getClientRecords, getOverviewModel } from './selectors'
import { buildCustomRangeSelection } from '../lib/rangeSelection'

describe('getClientRecords', () => {
  it('merges lead, thread, booking, snapshot, and QA state for one client', () => {
    const records = getClientRecords(demoDataset, demoDataset.clients[0].id)

    expect(records.length).toBeGreaterThan(40)
    expect(records[0].thread).toBeDefined()
    expect(records[0].latestSnapshot).toBeDefined()
    expect(records[0].bookingEvent).toBeDefined()
    expect(Array.isArray(records[0].qaEvents)).toBe(true)
  })
})

describe('getOverviewModel', () => {
  it('returns the overview surfaces needed for the first milestone', () => {
    const overview = getOverviewModel(demoDataset, demoDataset.clients[0].id, '30D')
    const conversionRate = overview.kpis.find((item) => item.key === 'conversionRate')

    expect(overview.kpis).toHaveLength(8)
    expect(overview.summary.primaryMetric.numericValue).toBeGreaterThan(0)
    expect(conversionRate?.valueMeta.numericValue).toBeGreaterThan(4)
    expect(conversionRate?.valueMeta.numericValue).toBeLessThan(8)
    expect(overview.funnelSeries).toHaveLength(6)
    expect(overview.funnelSeries.at(-1)?.value).toBeLessThanOrEqual(
      overview.funnelSeries.at(-2)?.value ?? 0,
    )
    expect(overview.leadTrend.length).toBeGreaterThan(5)
    expect(overview.bookingTrend.length).toBeGreaterThan(5)
    expect(overview.leadTrend.filter((item) => item.value > 0).length).toBeGreaterThan(12)
    expect(overview.topIssues).toHaveLength(3)
  })

  it('keeps client-facing metrics free of internal routing keys', () => {
    const overview = JSON.stringify(
      getOverviewModel(demoDataset, demoDataset.clients[0].id, '30D'),
    )

    expect(overview).not.toContain('route_id')
    expect(overview).not.toContain('selected_question_id')
    expect(overview).not.toContain('additional_search_scope')
  })

  it('keeps booking history populated across short and long ranges', () => {
    const recentOverview = getOverviewModel(demoDataset, demoDataset.clients[0].id, '30D')
    const weeklyOverview = getOverviewModel(demoDataset, demoDataset.clients[0].id, '7D')
    const allTimeOverview = getOverviewModel(
      demoDataset,
      demoDataset.clients[0].id,
      'All Time',
    )

    const recentBookings = recentOverview.bookingTrend.reduce(
      (sum, item) => sum + item.value,
      0,
    )
    const allTimeBookings = allTimeOverview.bookingTrend.reduce(
      (sum, item) => sum + item.value,
      0,
    )
    const weeklyBookings = weeklyOverview.bookingTrend.reduce(
      (sum, item) => sum + item.value,
      0,
    )

    expect(recentBookings).toBeGreaterThan(0)
    expect(weeklyBookings).toBeGreaterThan(0)
    expect(allTimeBookings).toBeGreaterThan(recentBookings)
  })

  it('applies custom ranges consistently across KPI and trend outputs', () => {
    const overview = getOverviewModel(
      demoDataset,
      demoDataset.clients[0].id,
      buildCustomRangeSelection(
        new Date('2026-03-01T00:00:00'),
        new Date('2026-03-30T00:00:00'),
      ),
    )

    expect(overview.rangeLabel).toContain('Mar')
    expect(overview.leadTrend.reduce((sum, item) => sum + item.value, 0)).toBeGreaterThan(0)
    expect(overview.bookingTrend.reduce((sum, item) => sum + item.value, 0)).toBeGreaterThan(0)
  })
})
