import { describe, expect, it } from 'vitest'
import { quickSearchEntries, searchDashboard } from './searchIndex'

describe('searchDashboard', () => {
  it('returns quick jumps when the query is empty', () => {
    expect(quickSearchEntries.length).toBeGreaterThan(0)
    expect(searchDashboard('', 4)).toHaveLength(4)
    expect(searchDashboard('', 4)[0]?.path).toBe('/overview')
  })

  it('routes metric searches to the relevant page section', () => {
    const showRateResult = searchDashboard('show rate', 1)[0]
    const recentThreadsResult = searchDashboard('recent threads', 1)[0]

    expect(showRateResult?.path).toBe('/bookings')
    expect(showRateResult?.sectionId).toBe('bookings-summary')
    expect(recentThreadsResult?.path).toBe('/conversations')
    expect(recentThreadsResult?.sectionId).toBe('conversations-workspace')
  })

  it('returns no results for unrelated gibberish', () => {
    expect(searchDashboard('qzvjjzxplm', 8)).toHaveLength(0)
  })
})
