import { describe, expect, it } from 'vitest'
import { demoDataset } from './demoData'
import {
  getConversationDetailModel,
  getConversationsModel,
  getClientRecords,
  getBookingsModel,
  getLeadDetailModel,
  getLeadsModel,
  getObjectionsModel,
  getOverviewModel,
  getPerformanceModel,
  getPipelineModel,
  getSettingsModel,
} from './selectors'
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
    const availableMetricKeys = overview.availableMetrics.map((item) => item.key)

    expect(overview.kpis).toHaveLength(8)
    expect(overview.summary.primaryMetric.numericValue).toBeGreaterThan(0)
    expect(conversionRate?.valueMeta.numericValue).toBeGreaterThan(4)
    expect(conversionRate?.valueMeta.numericValue).toBeLessThan(8)
    expect(overview.funnelSeries).toHaveLength(5)
    expect(overview.funnelSeries.at(-1)?.value).toBeLessThanOrEqual(
      overview.funnelSeries.at(-2)?.value ?? 0,
    )
    expect(overview.leadTrend.length).toBeGreaterThan(5)
    expect(overview.bookingTrend.length).toBeGreaterThan(5)
    expect(overview.leadTrend.filter((item) => item.value > 0).length).toBeGreaterThan(12)
    expect(overview.topIssues).toHaveLength(3)
    expect(availableMetricKeys).toContain('pipelineLeads')
    expect(availableMetricKeys).toContain('avgFirstResponse')
    expect(availableMetricKeys).toContain('avgReplyLatency')
    expect(availableMetricKeys).toContain('avgMessagesPerLead')
    expect(availableMetricKeys).toContain('threadCloseRate')
    expect(availableMetricKeys).toContain('objectionRecoveryRate')
    expect(availableMetricKeys).toContain('dropOffRate')
    expect(availableMetricKeys).toContain('confirmedBookings')
    expect(availableMetricKeys).toContain('atRiskBookings')
    expect(availableMetricKeys).toContain('showRate')
    expect(availableMetricKeys).toContain('noShowRate')
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

  it('keeps attention items recent and upcoming calls distributed', () => {
    const overview = getOverviewModel(demoDataset, demoDataset.clients[0].id, '30D')
    const attentionDays = overview.needsAttention.map((item) => Number.parseInt(item.stageAge, 10))
    const relativeTimes = overview.upcomingCalls.map((item) => item.relativeTime)
    const attentionNotes = overview.needsAttention.map((item) => item.note)

    expect(attentionDays.length).toBeGreaterThan(0)
    expect(attentionDays.every((value) => value >= 1 && value <= 5)).toBe(true)
    expect(attentionDays).toEqual([...attentionDays].sort((left, right) => left - right))
    expect(new Set(relativeTimes).size).toBeGreaterThan(2)
    expect(attentionNotes).not.toContain('Momentum is slowing down')
  })

  it('builds a varied funnel instead of flattening every late stage', () => {
    const overview = getOverviewModel(demoDataset, demoDataset.clients[0].id, '30D')
    const funnelValues = overview.funnelSeries.map((item) => item.value)

    expect(new Set(funnelValues).size).toBeGreaterThan(3)
    expect(overview.funnelSeries.at(-1)?.value).toBeLessThanOrEqual(
      overview.funnelSeries.at(-2)?.value ?? 0,
    )
    expect(overview.funnelSeries[2]?.value).not.toBe(overview.funnelSeries[3]?.value)
  })
})

describe('operational core selectors', () => {
  it('builds the pipeline page model from normalized records', () => {
    const pipeline = getPipelineModel(demoDataset, demoDataset.clients[0].id, '30D')
    const distributed = pipeline.stageDistribution.reduce((sum, item) => sum + item.value, 0)

    expect(pipeline.summaryCards).toHaveLength(4)
    expect(pipeline.alerts).toHaveLength(3)
    expect(pipeline.stageMovement.links).toHaveLength(4)
    expect(pipeline.avgTimeInStage).toHaveLength(5)
    expect(pipeline.responseGapByStage).toHaveLength(5)
    expect(pipeline.completionRate).toHaveLength(4)
    expect(pipeline.rows.length).toBeGreaterThan(20)
    expect(distributed).toBe(pipeline.rows.length)
  })

  it('builds a leads CRM model with filterable breakdowns', () => {
    const leads = getLeadsModel(demoDataset, demoDataset.clients[0].id, '30D')

    expect(leads.summaryCards).toHaveLength(4)
    expect(leads.rows.length).toBeGreaterThan(20)
    expect(leads.qualityMix.length).toBeGreaterThan(0)
    expect(leads.goalMix.length).toBeGreaterThan(0)
    expect(leads.experienceMix.length).toBeGreaterThan(0)
    expect(leads.commitmentMix.length).toBeGreaterThan(0)
    expect(leads.filterOptions.stages.length).toBeGreaterThan(0)
    expect(leads.filterOptions.goalTypes.length).toBeGreaterThan(0)
  })

  it('returns a client-safe lead detail model for the shared drawer', () => {
    const leads = getLeadsModel(demoDataset, demoDataset.clients[0].id, '30D')
    const detail = getLeadDetailModel(demoDataset, demoDataset.clients[0].id, leads.rows[0]?.id)
    const serialized = JSON.stringify(detail)

    expect(detail?.facts.length).toBeGreaterThan(5)
    expect(detail?.timeline.length).toBeGreaterThan(2)
    expect(detail?.transcriptPreview).toHaveLength(3)
    expect(serialized).not.toContain('route_id')
    expect(serialized).not.toContain('selected_question_id')
    expect(serialized).not.toContain('additional_search_scope')
  })
})

describe('conversation selectors', () => {
  it('builds a client-safe conversation model for the conversations page', () => {
    const conversations = getConversationsModel(demoDataset, demoDataset.clients[0].id, '30D')

    expect(conversations.summaryCards).toHaveLength(5)
    expect(conversations.rows.length).toBeGreaterThan(20)
    expect(conversations.volumeSeries.length).toBeGreaterThan(5)
    expect(conversations.outcomeSeries.length).toBeGreaterThan(0)
    expect(conversations.closeReasonSeries.length).toBeGreaterThan(0)
    expect(conversations.filterOptions.outcomes.length).toBeGreaterThan(0)
    expect(conversations.filterOptions.healthStates.length).toBeGreaterThan(0)
  })

  it('returns a conversation detail model without internal workflow fields', () => {
    const conversations = getConversationsModel(demoDataset, demoDataset.clients[0].id, '30D')
    const detail = getConversationDetailModel(
      demoDataset,
      demoDataset.clients[0].id,
      conversations.rows[0]?.id,
    )
    const serialized = JSON.stringify(detail)

    expect(detail?.summaryCards).toHaveLength(4)
    expect(detail?.facts.length).toBeGreaterThan(5)
    expect(detail?.timeline.length).toBeGreaterThan(2)
    expect(detail?.transcriptPreview).toHaveLength(3)
    expect(serialized).not.toContain('route_id')
    expect(serialized).not.toContain('selected_question_id')
    expect(serialized).not.toContain('additional_search_scope')
  })
})

describe('objections and bookings selectors', () => {
  it('builds an objections model with stable blocker and drop-off surfaces', () => {
    const objections = getObjectionsModel(demoDataset, demoDataset.clients[0].id, '30D')
    const serialized = JSON.stringify(objections)

    expect(objections.summaryCards).toHaveLength(4)
    expect(objections.distribution.length).toBeGreaterThan(0)
    expect(objections.trendSeries.length).toBeGreaterThan(4)
    expect(objections.dropOffByStage.length).toBeGreaterThan(0)
    expect(objections.recoveryByType.length).toBeGreaterThan(0)
    expect(objections.recoveredExamples.length).toBeGreaterThan(0)
    expect(serialized).not.toContain('route_id')
    expect(serialized).not.toContain('selected_question_id')
    expect(serialized).not.toContain('additional_search_scope')
  })

  it('builds a bookings model with funnel, trend, and operational lists', () => {
    const bookings = getBookingsModel(demoDataset, demoDataset.clients[0].id, '30D')
    const serialized = JSON.stringify(bookings)

    expect(bookings.summaryCards).toHaveLength(4)
    expect(bookings.funnelSeries).toHaveLength(3)
    expect(bookings.funnelSeries[0]?.stage).toBe('Proposed')
    expect(bookings.funnelSeries.at(-1)?.value).toBeLessThanOrEqual(
      bookings.funnelSeries.at(-2)?.value ?? 0,
    )
    expect(bookings.confirmedTrend.length).toBeGreaterThan(4)
    expect(bookings.attendanceSeries.length).toBeGreaterThan(0)
    expect(bookings.upcomingBookings.length).toBeGreaterThan(0)
    expect(bookings.frictionSummary.length).toBeGreaterThan(0)
    expect(serialized).not.toContain('route_id')
    expect(serialized).not.toContain('selected_question_id')
    expect(serialized).not.toContain('additional_search_scope')
  })
})

describe('performance and settings selectors', () => {
  it('builds a performance model with QA, verdict, and coaching surfaces', () => {
    const performance = getPerformanceModel(demoDataset, demoDataset.clients[0].id, '30D')
    const serialized = JSON.stringify(performance)

    expect(performance.summaryCards).toHaveLength(4)
    expect(performance.reviewScoreTrend.length).toBeGreaterThan(4)
    expect(performance.verdictDistribution.length).toBeGreaterThan(0)
    expect(performance.qualityByStage.length).toBeGreaterThan(0)
    expect(performance.reviewPressureSeries.length).toBeGreaterThan(4)
    expect(performance.coachingQueue.length).toBeGreaterThan(0)
    expect(performance.topCorrectionThemes.length).toBeGreaterThan(0)
    expect(performance.strongestSegment.label).toBeTruthy()
    expect(serialized).not.toContain('route_id')
    expect(serialized).not.toContain('selected_question_id')
    expect(serialized).not.toContain('additional_search_scope')
  })

  it('builds a settings model with dashboard and overview defaults', () => {
    const settings = getSettingsModel(
      {
        clients: demoDataset.clients,
        defaultLandingPath: '/performance',
        defaultRangePreset: '30D',
        numberFormat: 'compact',
        overviewMetricSlots: ['totalLeads', 'avgReplyQuality'],
        overviewUseCompactNumbers: true,
        overviewWidgetSlots: ['funnel', 'leadTrend', 'bookingTrend', 'qualificationBreakdown'],
      },
      demoDataset.clients[0].id,
      getOverviewModel(demoDataset, demoDataset.clients[0].id, '30D').availableMetrics,
    )

    expect(settings.workspaceIdentity.workspaceName).toContain('Inflow')
    expect(settings.dashboardDefaults.landingOptions.length).toBeGreaterThan(4)
    expect(settings.dashboardDefaults.rangeOptions.length).toBeGreaterThan(4)
    expect(settings.overviewDefaults.metricOptions.length).toBeGreaterThan(8)
    expect(settings.overviewDefaults.widgetOptions.length).toBeGreaterThan(3)
    expect(settings.displayPreferences.useCompactNumbers).toBe(true)
    expect(settings.sessionAccount.email).toContain('@')
  })
})
