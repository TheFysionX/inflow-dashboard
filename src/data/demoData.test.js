import { describe, expect, it } from 'vitest'
import { buildDemoDataset, DEMO_DATA_START, REFERENCE_NOW } from './demoData'

describe('buildDemoDataset', () => {
  it('creates deterministic workbook-backed demo data', () => {
    const firstPass = buildDemoDataset()
    const secondPass = buildDemoDataset()

    expect(firstPass.clients).toHaveLength(1)
    expect(firstPass.dailyFacts).toHaveLength(secondPass.dailyFacts.length)
    expect(firstPass.leadFacts).toHaveLength(secondPass.leadFacts.length)
    expect(firstPass.dailyFacts[0]).toEqual(secondPass.dailyFacts[0])
    expect(firstPass.leadFacts[0]).toEqual(secondPass.leadFacts[0])
  })

  it('covers a realistic recent date window', () => {
    const dataset = buildDemoDataset()
    const leadDates = dataset.leadFacts.map((lead) => new Date(`${lead.created_date}T12:00:00.000Z`).getTime())
    const earliestLead = Math.min(...leadDates)
    const latestLead = Math.max(...leadDates)

    expect(latestLead).toBeLessThanOrEqual(REFERENCE_NOW.getTime() + (2 * 24 * 60 * 60 * 1000))
    expect(earliestLead).toBeLessThanOrEqual(DEMO_DATA_START.getTime() + (31 * 24 * 60 * 60 * 1000))
  })

  it('keeps recent and upcoming bookings populated for the demo', () => {
    const dataset = buildDemoDataset()
    const recentThreshold = REFERENCE_NOW.getTime() - (7 * 24 * 60 * 60 * 1000)
    const recentBookings = dataset.leadFacts.filter((lead) => {
      const confirmedAt = lead.confirmed_date
        ? new Date(`${lead.confirmed_date}T12:00:00.000Z`).getTime()
        : 0
      return confirmedAt >= recentThreshold && confirmedAt <= REFERENCE_NOW.getTime()
    })
    const upcomingBookings = dataset.leadFacts.filter((lead) => {
      const callAt = lead.call_date ? new Date(`${lead.call_date}T12:00:00.000Z`).getTime() : 0
      return callAt > REFERENCE_NOW.getTime()
    })

    expect(recentBookings.length).toBeGreaterThan(0)
    expect(upcomingBookings.length).toBeGreaterThan(0)
  })
})
