import {
  DEMO_DATA_START,
  REFERENCE_NOW,
  STAGE_LABELS,
  STAGE_ORDER,
} from './demoData'
import {
  OVERVIEW_DATA_CUTOFF,
  getOverviewLeadOverride,
  getOverviewUpcomingCallSlot,
} from './overviewSupplement'
import {
  brandConfig,
  demoCredentials,
  navigationItems,
  overviewRangeOptions,
} from '../config/navigation'
import {
  DEFAULT_OVERVIEW_METRIC_SLOTS,
  getWidgetOptionState,
  normalizeOverviewMetricSlots,
  normalizeOverviewWidgetSlots,
} from '../config/overviewLayout'
import {
  DEFAULT_RANGE_PRESET,
  RANGE_PRESET_LABELS,
  getRangeSelectionKey,
  normalizeRangeSelection,
} from '../lib/rangeSelection'

const DAY = 24 * 60 * 60 * 1000
const HOUR = 60 * 60 * 1000

export const DEFAULT_DATE_RANGE = DEFAULT_RANGE_PRESET

const REFERENCE_DAY_START = startOfDay(REFERENCE_NOW)
const REFERENCE_DAY_END = endOfDay(REFERENCE_NOW)

const qualificationColors = {
  qualified: '#8be7c2',
  unqualified: '#ff8bb9',
  unclear: '#89b8ff',
}

const objectionColors = {
  time: '#8f6dff',
  trust: '#75c9ff',
  risk: '#c38cff',
  confidence: '#ff9fe1',
  cost: '#6d9cff',
  other: '#b7a7ff',
}

const objectionLabels = {
  time: 'Time',
  trust: 'Trust',
  risk: 'Risk',
  confidence: 'Confidence',
  cost: 'Cost',
  other: 'Other',
}

const conversationOutcomeColors = {
  active: '#74c7ff',
  booked: '#8f6dff',
  stalled: '#f49be3',
  closed: '#8be7c2',
}

const conversationHealthColors = {
  healthy: '#8be7c2',
  needs_review: '#ff8bb9',
  guardrail_touched: '#89b8ff',
}

const conversationCloseReasonColors = {
  booked: '#8f6dff',
  no_show: '#ff8bb9',
  closed_lost: '#89b8ff',
  objection: '#f49be3',
  natural_stop: '#8be7c2',
  controlled_close: '#b7a7ff',
}

const stagePartMap = {
  opening: 'intro',
  current: 'context',
  desired: 'target',
  objection: 'friction',
  book: 'scheduling',
}

const firstNames = [
  'Maya',
  'Jordan',
  'Avery',
  'Noah',
  'Leah',
  'Miles',
  'Tessa',
  'Roman',
  'Nina',
  'Evan',
  'Cam',
  'Jules',
  'Sienna',
  'Kai',
  'Theo',
  'Parker',
  'Ruby',
  'Owen',
  'Skye',
  'Lena',
]

const lastInitials = ['A', 'B', 'C', 'D', 'F', 'G', 'J', 'K', 'L', 'M', 'P', 'R', 'S', 'T']

function toDateTime(value, options = {}) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return new Date(value.getTime())
  }

  const { boundary = 'midday' } = options

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    if (boundary === 'start') {
      return new Date(`${value}T00:00:00.000Z`)
    }

    if (boundary === 'end') {
      return new Date(`${value}T23:59:59.999Z`)
    }

    return new Date(`${value}T12:00:00.000Z`)
  }

  return new Date(value)
}

function isWithinWindow(dateValue, window) {
  if (!dateValue || !window) {
    return false
  }

  const date = typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ? toDateTime(dateValue, { boundary: 'midday' })
    : toDateTime(dateValue)

  if (!date || Number.isNaN(date.getTime())) {
    return false
  }

  return date >= window.start && date <= window.end
}

function startOfDay(value) {
  const date = toDateTime(value)
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function endOfDay(value) {
  const date = toDateTime(value)
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999),
  )
}

function addDays(value, days) {
  return new Date(toDateTime(value).getTime() + (days * DAY))
}

function addHours(value, hours) {
  return new Date(toDateTime(value).getTime() + (hours * HOUR))
}

function startOfMonth(value) {
  const date = toDateTime(value)
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

function endOfMonth(value) {
  const date = toDateTime(value)
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  )
}

function countInclusiveDays(start, end) {
  return Math.round((endOfDay(end).getTime() - startOfDay(start).getTime()) / DAY) + 1
}

function formatDayLabel(value) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(toDateTime(value))
}

function formatMonthLabel(value) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  }).format(toDateTime(value))
}

function formatHourLabel(value) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    timeZone: 'UTC',
  }).format(toDateTime(value))
}

function resolveWindow(rangeSelection) {
  const selection = normalizeRangeSelection(rangeSelection)
  const key = getRangeSelectionKey(selection)

  if (selection.mode === 'custom') {
    const start = startOfDay(selection.startDate)
    const end = new Date(
      Math.min(endOfDay(selection.endDate).getTime(), REFERENCE_DAY_END.getTime()),
    )

    return {
      selection,
      range: selection.label,
      label: selection.label,
      key,
      days: countInclusiveDays(start, end),
      start,
      end,
    }
  }

  if (selection.preset === 'YTD') {
    const start = new Date(Date.UTC(REFERENCE_NOW.getUTCFullYear(), 0, 1))

    return {
      selection,
      range: selection.preset,
      label: selection.label,
      key,
      days: countInclusiveDays(start, REFERENCE_DAY_END),
      start,
      end: REFERENCE_DAY_END,
    }
  }

  if (selection.preset === 'All Time') {
    const start = startOfDay(DEMO_DATA_START)

    return {
      selection,
      range: selection.preset,
      label: selection.label,
      key,
      days: countInclusiveDays(start, REFERENCE_DAY_END),
      start,
      end: REFERENCE_DAY_END,
    }
  }

  if (selection.preset === '12M') {
    const start = new Date(
      Date.UTC(
        REFERENCE_DAY_END.getUTCFullYear(),
        REFERENCE_DAY_END.getUTCMonth() - 11,
        1,
      ),
    )

    return {
      selection,
      range: selection.preset,
      label: selection.label,
      key,
      days: countInclusiveDays(start, REFERENCE_DAY_END),
      start,
      end: REFERENCE_DAY_END,
    }
  }

  const presetDays = {
    '24H': 1,
    '7D': 7,
    '30D': 30,
    '3M': 90,
    '6M': 182,
    '90D': 90,
  }[selection.preset] ?? {
    '24H': 1,
    '7D': 7,
    '30D': 30,
    '3M': 90,
    '6M': 182,
    '90D': 90,
  }[DEFAULT_DATE_RANGE]

  const start = new Date(REFERENCE_DAY_START.getTime() - ((presetDays - 1) * DAY))

  return {
    selection,
    range: selection.preset,
    label: selection.label,
    key,
    days: presetDays,
    start,
    end: REFERENCE_DAY_END,
  }
}

function previousWindow(window) {
  const span = window.end.getTime() - window.start.getTime() + 1
  const end = new Date(window.start.getTime() - 1)
  const start = new Date(end.getTime() - (span - 1))

  return {
    range: `${window.range}-previous`,
    days: countInclusiveDays(start, end),
    start,
    end,
  }
}

function getBucketStrategy(range) {
  if (range.selection.mode === 'custom') {
    if (range.days <= 1) {
      return 'hourly'
    }

    if (range.days <= 31) {
      return 'daily'
    }

    if (range.days <= 184) {
      return 'weekly'
    }

    return 'monthly'
  }

  const presetStrategy = {
    '24H': 'hourly',
    '7D': 'daily',
    '30D': 'daily',
    '3M': 'weekly',
    '6M': 'weekly',
    '90D': 'weekly',
    YTD: 'weekly',
    '12M': 'monthly',
    'All Time': 'monthly',
  }

  return presetStrategy[range.selection.preset] ?? 'daily'
}

function createBuckets(range) {
  const strategy = getBucketStrategy(range)
  const buckets = []

  if (strategy === 'hourly') {
    const hourlyEnd = new Date(
      Math.min(REFERENCE_NOW.getTime(), range.end.getTime()),
    )
    const start = new Date(hourlyEnd.getTime() - (23 * HOUR))

    for (let index = 0; index < 24; index += 1) {
      const bucketStart = addHours(start, index)
      const bucketEnd = index === 23
        ? hourlyEnd
        : new Date(bucketStart.getTime() + HOUR - 1)

      buckets.push({
        key: bucketEnd.toISOString(),
        label: formatHourLabel(bucketEnd),
        start: bucketStart,
        end: bucketEnd,
      })
    }

    return { strategy, buckets }
  }

  if (strategy === 'weekly') {
    let cursor = startOfDay(range.start)

    while (cursor <= range.end) {
      const bucketStart = cursor
      const bucketEnd = new Date(
        Math.min(endOfDay(addDays(bucketStart, 6)).getTime(), range.end.getTime()),
      )

      buckets.push({
        key: bucketEnd.toISOString(),
        label: formatDayLabel(bucketEnd),
        start: bucketStart,
        end: bucketEnd,
      })

      cursor = addDays(bucketStart, 7)
    }

    return { strategy, buckets }
  }

  if (strategy === 'monthly') {
    let cursor = startOfMonth(range.start)
    const finalMonth = startOfMonth(range.end)

    while (cursor <= finalMonth) {
      const bucketStart = cursor < range.start ? range.start : cursor
      const bucketEnd = new Date(
        Math.min(endOfMonth(cursor).getTime(), range.end.getTime()),
      )

      buckets.push({
        key: bucketEnd.toISOString(),
        label: formatMonthLabel(bucketEnd),
        start: bucketStart,
        end: bucketEnd,
      })

      cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1))
    }

    return { strategy, buckets }
  }

  let cursor = startOfDay(range.start)

  while (cursor <= range.end) {
    const bucketStart = cursor
    const bucketEnd = new Date(
      Math.min(endOfDay(bucketStart).getTime(), range.end.getTime()),
    )

    buckets.push({
      key: bucketEnd.toISOString(),
      label: formatDayLabel(bucketEnd),
      start: bucketStart,
      end: bucketEnd,
    })

    cursor = addDays(bucketStart, 1)
  }

  return { strategy, buckets }
}

function average(values) {
  if (!values.length) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0)
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value < 100 ? 1 : 0,
  }).format(value)
}

function formatPercent(value, digits = 0) {
  return `${value.toFixed(digits)}%`
}

function formatDateTime(dateValue) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(toDateTime(dateValue))
}

function formatRelativeTime(dateValue) {
  const diff = toDateTime(dateValue).getTime() - REFERENCE_NOW.getTime()
  const absoluteHours = Math.max(1, Math.round(Math.abs(diff) / HOUR))
  const absoluteDays = Math.max(1, Math.round(Math.abs(diff) / DAY))

  if (diff > 0) {
    if (absoluteHours < 24) {
      return `in ${absoluteHours}h`
    }

    return `in ${absoluteDays}d`
  }

  if (absoluteHours < 24) {
    return `${absoluteHours}h ago`
  }

  return `${absoluteDays}d ago`
}

function formatStageAge(dateValue) {
  const diffDays = Math.max(
    1,
    Math.round((REFERENCE_NOW.getTime() - toDateTime(dateValue).getTime()) / DAY),
  )

  return `${diffDays}d in stage`
}

function deltaMeta(current, previous, invertTone = false) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return { value: '0%', tone: 'neutral' }
  }

  if (previous === 0) {
    if (current === 0) {
      return { value: '0%', tone: 'neutral' }
    }

    return { value: '+100%', tone: invertTone ? 'negative' : 'positive' }
  }

  const delta = ((current - previous) / previous) * 100
  const formatted = `${delta >= 0 ? '+' : ''}${delta.toFixed(Math.abs(delta) < 10 ? 1 : 0)}%`

  if (delta > 0.5) {
    return { value: formatted, tone: invertTone ? 'negative' : 'positive' }
  }

  if (delta < -0.5) {
    return { value: formatted, tone: invertTone ? 'positive' : 'negative' }
  }

  return { value: formatted, tone: 'neutral' }
}

function buildMetric({
  key,
  label,
  numericValue,
  previousValue,
  detail,
  routePath,
  compact = false,
  prefix = '',
  suffix = '',
  decimals = 0,
  invertTone = false,
}) {
  return {
    key,
    label,
    detail,
    routePath,
    value: prefix || suffix || compact
      ? `${prefix}${formatCompactNumber(numericValue)}${suffix}`
      : numericValue,
    valueMeta: {
      numericValue,
      prefix,
      suffix,
      compact,
      decimals,
    },
    delta: deltaMeta(numericValue, previousValue, invertTone),
  }
}

function buildLeadAlias(leadId) {
  const numericId = Number.parseInt(String(leadId).replace(/\D/g, ''), 10) || 0
  const firstName = firstNames[numericId % firstNames.length]
  const lastInitial = lastInitials[(numericId * 3) % lastInitials.length]
  return `${firstName} ${lastInitial}.`
}

function normalizeObjectionType(objectionType) {
  const value = String(objectionType || '').trim().toLowerCase()

  if (!value) {
    return 'none'
  }

  if (value === 'price') {
    return 'cost'
  }

  if (value === 'proof') {
    return 'trust'
  }

  if (value === 'self_doubt') {
    return 'confidence'
  }

  if (value === 'fit') {
    return 'risk'
  }

  if (value === 'call') {
    return 'other'
  }

  return value
}

function inferBookingIntent(leadFact) {
  if (leadFact.booking_intent) {
    return leadFact.booking_intent
  }

  if (leadFact.confirmed_date || leadFact.call_date || leadFact.book_date) {
    return 'yes'
  }

  return leadFact.qualification_signal === 'qualified' ? 'maybe' : 'no'
}

function deriveCurrentStage(leadFact) {
  const finalStatus = leadFact.final_status

  if (
    finalStatus === 'won' ||
    finalStatus === 'lost_after_call' ||
    finalStatus === 'no_show' ||
    finalStatus === 'booking_pending' ||
    finalStatus === 'confirmed_future_call'
  ) {
    return 'book'
  }

  if (finalStatus === 'lost_objection' || finalStatus === 'stalled_objection') {
    return 'objection'
  }

  if (finalStatus === 'active_desired_end' || finalStatus === 'stalled_desired') {
    return 'desired'
  }

  if (finalStatus === 'stalled_current') {
    return 'current'
  }

  if (leadFact.book_date || leadFact.confirmed_date || leadFact.call_date || leadFact.close_date) {
    return 'book'
  }

  if (leadFact.objection_date) {
    return 'objection'
  }

  if (leadFact.desired_date) {
    return 'desired'
  }

  if (leadFact.current_date) {
    return 'current'
  }

  return 'opening'
}

function pickHistoricalDate(candidates, fallback) {
  const datedCandidates = candidates
    .filter(Boolean)
    .map((value) => ({
      value,
      date: toDateTime(value),
    }))
    .filter(({ date }) => date && !Number.isNaN(date.getTime()))

  const historical = datedCandidates.find(({ date }) => date <= REFERENCE_DAY_END)

  return historical?.value ?? fallback ?? null
}

function getStageEntryDate(leadFact, stage) {
  if (stage === 'book') {
    return pickHistoricalDate(
      [leadFact.book_date, leadFact.confirmed_date, leadFact.call_date, leadFact.close_date],
      leadFact.created_date,
    )
  }

  if (stage === 'objection') {
    return pickHistoricalDate(
      [leadFact.objection_date, leadFact.desired_date, leadFact.current_date],
      leadFact.created_date,
    )
  }

  if (stage === 'desired') {
    return pickHistoricalDate([leadFact.desired_date, leadFact.current_date], leadFact.created_date)
  }

  if (stage === 'current') {
    return pickHistoricalDate([leadFact.current_date], leadFact.created_date)
  }

  return pickHistoricalDate([leadFact.opening_date], leadFact.created_date)
}

function deriveThreadClosed(leadFact) {
  return ['won', 'lost_after_call', 'lost_objection', 'no_show'].includes(leadFact.final_status)
}

function deriveThreadCloseReason(leadFact) {
  if (leadFact.final_status === 'won') {
    return 'closed_won'
  }

  if (leadFact.final_status === 'no_show') {
    return 'no_show'
  }

  if (leadFact.final_status === 'lost_after_call') {
    return 'closed_lost'
  }

  if (leadFact.final_status === 'lost_objection') {
    return 'objection'
  }

  return ''
}

function deriveLeadStatus(leadFact, threadClosed, callTime, enteredStageAt, lastActivityAt) {
  if (threadClosed) {
    return 'closed'
  }

  if (callTime && toDateTime(callTime) > REFERENCE_NOW) {
    return 'scheduled'
  }

  const stageAgeDays = Math.max(
      1,
      Math.round((REFERENCE_NOW.getTime() - toDateTime(enteredStageAt).getTime()) / DAY),
  )
  const replyGapHours = Math.max(
    1,
    Math.round((REFERENCE_NOW.getTime() - toDateTime(lastActivityAt).getTime()) / HOUR),
  )

  if (leadFact.final_status.startsWith('stalled') || stageAgeDays >= 5 || replyGapHours >= 72) {
    return 'needs_attention'
  }

  return 'active'
}

function buildQaEvents(leadFact, activityAt) {
  if (!leadFact.reviewed_replies) {
    return []
  }

  let reviewConfidence = 'low'

  if (leadFact.avg_review_score >= 90) {
    reviewConfidence = 'high'
  } else if (leadFact.avg_review_score >= 84) {
    reviewConfidence = 'medium'
  }

  return [
    {
      id: `qa-${leadFact.lead_id}`,
      threadId: `thread-${leadFact.lead_id}`,
      reviewVerdict: leadFact.review_verdict || 'good',
      reviewConfidence,
      guardrailChanged: leadFact.guardrail_interventions > 0,
      createdAt: activityAt,
    },
  ]
}

function getActivityDateCandidates(leadFact) {
  return [
    leadFact.close_date,
    leadFact.confirmed_date,
    leadFact.book_date,
    leadFact.refund_date,
    leadFact.inactive_date,
    leadFact.objection_date,
    leadFact.desired_date,
    leadFact.current_date,
    leadFact.opening_date,
    leadFact.qualification_date,
    leadFact.created_date,
  ].filter(Boolean)
}

function toIso(value) {
  if (!value) {
    return ''
  }

  return toDateTime(value).toISOString()
}

function getDailyFacts(dataset, clientId) {
  const singleClientId = dataset.clients[0]?.id

  if (!clientId || clientId === singleClientId) {
    return (dataset.dailyFacts ?? []).filter((fact) => fact.date <= OVERVIEW_DATA_CUTOFF)
  }

  return []
}

function createTrendSeries(dailyFacts, range, field) {
  const { buckets } = createBuckets(range)

  return buckets.map((bucket) => ({
    label: bucket.label,
    value: sum(
      dailyFacts
        .filter((fact) => isWithinWindow(fact.date, bucket))
        .map((fact) => Number(fact[field] ?? 0)),
    ),
  }))
}

function createWeightedTrendSeries(dailyFacts, range, valueField, weightField) {
  const { buckets } = createBuckets(range)

  return buckets.map((bucket) => ({
    label: bucket.label,
    value: weightedDailyAverage(dailyFacts, bucket, valueField, weightField),
  }))
}

function createMultiFieldTrendSeries(dailyFacts, range, definitions) {
  const { buckets } = createBuckets(range)

  return buckets.map((bucket) => ({
    label: bucket.label,
    ...Object.fromEntries(
      definitions.map((definition) => [
        definition.key,
        definition.mode === 'weighted'
          ? weightedDailyAverage(
            dailyFacts,
            bucket,
            definition.valueField,
            definition.weightField,
          )
          : sumDailyField(dailyFacts, bucket, definition.field),
      ]),
    ),
  }))
}

function getLatestDailyFact(dailyFacts, window) {
  const withinWindow = dailyFacts
    .filter((fact) => isWithinWindow(fact.date, window))
    .sort((left, right) => toDateTime(left.date) - toDateTime(right.date))

  if (withinWindow.length) {
    return withinWindow.at(-1)
  }

  return [...dailyFacts]
    .filter((fact) => toDateTime(fact.date) <= window.end)
    .sort((left, right) => toDateTime(left.date) - toDateTime(right.date))
    .at(-1)
}

function sumDailyField(dailyFacts, window, field) {
  return sum(
    dailyFacts
      .filter((fact) => isWithinWindow(fact.date, window))
      .map((fact) => Number(fact[field] ?? 0)),
  )
}

function weightedDailyAverage(dailyFacts, window, valueField, weightField) {
  const facts = dailyFacts.filter((fact) => isWithinWindow(fact.date, window))
  const totalWeight = sum(facts.map((fact) => Number(fact[weightField] ?? 0)))

  if (!totalWeight) {
    return 0
  }

  const weightedTotal = sum(
    facts.map(
      (fact) =>
        Number(fact[valueField] ?? 0) * Number(fact[weightField] ?? 0),
    ),
  )

  return weightedTotal / totalWeight
}

function getObjectionTotals(dailyFacts, window) {
  return dailyFacts
    .filter((fact) => isWithinWindow(fact.date, window))
    .reduce(
      (totals, fact) => ({
        time: totals.time + Number(fact.objection_time ?? 0),
        trust:
          totals.trust +
          Number(fact.objection_trust ?? 0) +
          Number(fact.objection_proof ?? 0),
        risk: totals.risk + Number(fact.objection_fit ?? 0),
        confidence: totals.confidence + Number(fact.objection_self_doubt ?? 0),
        cost: totals.cost + Number(fact.objection_price ?? 0),
        other:
          totals.other +
          Number(fact.objection_call ?? 0) +
          Number(fact.objection_other ?? 0),
      }),
      {
        time: 0,
        trust: 0,
        risk: 0,
        confidence: 0,
        cost: 0,
        other: 0,
      },
    )
}

export function getClientRecords(dataset, clientId) {
  const singleClientId = dataset.clients[0]?.id

  if (clientId && clientId !== singleClientId) {
    return []
  }

  return (dataset.leadFacts ?? []).map((leadFact) => {
    const currentStage = deriveCurrentStage(leadFact)
    const overviewOverride = getOverviewLeadOverride(leadFact.lead_id) ?? {}
    const enteredStageAt = overviewOverride.enteredStageAt || toIso(
      getStageEntryDate(leadFact, currentStage),
    )
    const threadClosed = deriveThreadClosed(leadFact)
    const callTime = overviewOverride.callTime || (leadFact.call_date ? toIso(leadFact.call_date) : '')
    const confirmedTime = overviewOverride.confirmedTime ||
      (leadFact.confirmed_date
        ? toIso(leadFact.confirmed_date)
        : leadFact.call_date
          ? toIso(leadFact.call_date)
          : '')
    const lastActivityAt = overviewOverride.lastActivityAt || toIso(
      pickHistoricalDate(getActivityDateCandidates(leadFact), leadFact.created_date),
    )
    const bookingIntent = inferBookingIntent(leadFact)
    const normalizedObjectionType = normalizeObjectionType(leadFact.objection_type)
    const qaEvents = buildQaEvents(leadFact, lastActivityAt)
    const displayName = buildLeadAlias(leadFact.lead_id)

    return {
      leadFact,
      overviewOverride,
      lead: {
        id: leadFact.lead_id,
        clientId: singleClientId,
        displayName,
        source: leadFact.source_channel,
        createdAt: toIso(leadFact.created_date),
        status: deriveLeadStatus(leadFact, threadClosed, callTime, enteredStageAt, lastActivityAt),
      },
      thread: {
        id: `thread-${leadFact.lead_id}`,
        leadId: leadFact.lead_id,
        currentStage,
        currentStagePart: stagePartMap[currentStage],
        activeRouteId: `${currentStage}.workbook`,
        threadClosed,
        threadCloseReason: deriveThreadCloseReason(leadFact),
        lastMessageAt: lastActivityAt,
        enteredStageAt,
      },
      messages: [],
      snapshots: [],
      latestSnapshot: {
        id: `snapshot-${leadFact.lead_id}`,
        threadId: `thread-${leadFact.lead_id}`,
        createdAt: lastActivityAt,
        leadProfileJson: {
          experience_level: leadFact.experience_level,
          work_role: leadFact.work_role,
          commitment_level: leadFact.commitment_level,
          goal_type: leadFact.goal_type,
          target_outcome_value: leadFact.target_outcome_value,
          current_gap_to_target: leadFact.current_gap_to_target,
          qualification_signal: leadFact.qualification_signal || 'unclear',
          objection_type: normalizedObjectionType,
          funding_ability: leadFact.funding_ability,
        },
        bookingStateJson: {
          booking_intent: bookingIntent,
          proposed_time: leadFact.book_date ? toIso(leadFact.book_date) : '',
          confirmed_time: confirmedTime,
          timezone: leadFact.timezone || 'PT',
        },
      },
      bookingEvent: {
        id: `booking-${leadFact.lead_id}`,
        leadId: leadFact.lead_id,
        bookingIntent,
        proposedTime: leadFact.book_date ? toIso(leadFact.book_date) : '',
        confirmedTime,
        callTime,
        timezone: leadFact.timezone || 'PT',
        attendedCall: leadFact.show_status === 'attended',
        noShow: leadFact.show_status === 'no_show' || leadFact.final_status === 'no_show',
        createdAt: toIso(leadFact.created_date),
      },
      qaEvents,
      reviewScore: Number(leadFact.avg_review_score ?? 0),
      qualification: leadFact.qualification_signal || 'unclear',
      objectionType: normalizedObjectionType,
      bookingIntent,
      confirmedTime,
      callTime,
      stageRank: STAGE_ORDER.indexOf(currentStage),
    }
  })
}

function getAttentionItems(records) {
  return records
    .filter((record) => !record.thread.threadClosed)
    .filter((record) => record.lead.status !== 'scheduled')
    .map((record) => {
      const stageAgeDays = Math.max(
        1,
        Math.round(
          (REFERENCE_NOW.getTime() - new Date(record.thread.enteredStageAt).getTime()) / DAY,
        ),
      )
      const replyGapHours = Math.max(
        1,
        Math.round(
          (REFERENCE_NOW.getTime() - new Date(record.thread.lastMessageAt).getTime()) / HOUR,
        ),
      )
      const recencyDays = Math.round(
        (REFERENCE_NOW.getTime() - new Date(record.thread.lastMessageAt).getTime()) / DAY,
      )

      const visibleGapDays = Math.max(
        1,
        Math.min(
          5,
          record.overviewOverride.attentionNote
            ? Math.max(stageAgeDays, Math.max(1, Math.round(replyGapHours / 24)))
            : Math.max(stageAgeDays, Math.max(1, Math.round(replyGapHours / 24))),
        ),
      )

      if (recencyDays > 5 || visibleGapDays > 5) {
        return null
      }

      const note = record.overviewOverride.attentionNote
        || (replyGapHours >= 72
          ? `No reply for ${Math.max(1, Math.round(replyGapHours / 24))} days`
          : stageAgeDays >= 4
            ? `${STAGE_LABELS[record.thread.currentStage]} requires attention`
            : `${STAGE_LABELS[record.thread.currentStage]} follow-up is due`)

      return {
        leadName: record.lead.displayName,
        stage: STAGE_LABELS[record.thread.currentStage],
        stageAge: `${visibleGapDays}d in stage`,
        note,
        status: stageAgeDays >= 5 || replyGapHours >= 72 ? 'warning' : 'info',
        recencyDays: visibleGapDays,
        lastActivityAt: record.thread.lastMessageAt,
      }
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (left.recencyDays !== right.recencyDays) {
        return left.recencyDays - right.recencyDays
      }

      return new Date(right.lastActivityAt) - new Date(left.lastActivityAt)
    })
    .slice(0, 8)
}

function getUpcomingCalls(records) {
  const upperBound = REFERENCE_NOW.getTime() + (14 * DAY)

  return records
    .filter((record) => {
      if (!record.callTime) {
        return false
      }

      const callAt = new Date(record.callTime).getTime()
      return callAt > REFERENCE_NOW.getTime() && callAt <= upperBound
    })
    .sort((left, right) => new Date(left.callTime) - new Date(right.callTime))
    .slice(0, 8)
    .map((record, index) => {
      const scheduledTime = getOverviewUpcomingCallSlot(index) || record.callTime

      return {
      leadName: record.lead.displayName,
      time: formatDateTime(scheduledTime),
      relativeTime: formatRelativeTime(scheduledTime),
      timezone: record.bookingEvent.timezone,
      }
    })
}

function buildFunnelSeries(dailyFacts, window) {
  const rawStages = [
    {
      stage: STAGE_LABELS.opening,
      value: sumDailyField(dailyFacts, window, 'opening_entries'),
      routePath: '/pipeline',
    },
    {
      stage: STAGE_LABELS.current,
      value: sumDailyField(dailyFacts, window, 'current_entries'),
      routePath: '/pipeline',
    },
    {
      stage: STAGE_LABELS.desired,
      value: sumDailyField(dailyFacts, window, 'desired_entries'),
      routePath: '/pipeline',
    },
    {
      stage: STAGE_LABELS.book,
      value: sumDailyField(dailyFacts, window, 'book_entries'),
      routePath: '/bookings',
    },
    {
      stage: 'Confirmed',
      value: sumDailyField(dailyFacts, window, 'confirmed_calls'),
      routePath: '/bookings',
    },
  ]

  return rawStages.map((item, index) => {
    if (index !== rawStages.length - 1) {
      return item
    }

    const bookValue = rawStages[index - 1]?.value ?? item.value

    return {
      ...item,
      value: Math.min(item.value, bookValue),
    }
  })
}

function getTopIssues(records, objectionSeries, funnelSeries) {
  const [topObjection] = objectionSeries
  const stageDropOffs = funnelSeries.slice(0, -1).map((stageItem, index) => ({
    stage: stageItem.stage,
    dropOff:
      stageItem.value - (funnelSeries[index + 1]?.value ?? 0),
  }))
  const biggestDropOffStage = [...stageDropOffs].sort(
    (left, right) => right.dropOff - left.dropOff,
  )[0]
  const qaByStage = STAGE_ORDER.map((stage) => ({
    stage,
    score: average(
      records
        .filter((record) => record.thread.currentStage === stage && record.reviewScore)
        .map((record) => record.reviewScore),
    ),
  }))
  const weakestQaStage = [...qaByStage].sort((left, right) => left.score - right.score)[0]

  return [
    {
      title: 'Most common objection',
      value: topObjection?.name ?? 'Time',
      note: 'Open in Objections',
      tone: 'warning',
      routePath: '/objections',
      routeLabel: 'Objections',
    },
    {
      title: 'Biggest drop-off stage',
      value: biggestDropOffStage?.stage ?? 'Objection',
      note: 'Open in Pipeline',
      tone: 'danger',
      routePath: '/pipeline',
      routeLabel: 'Pipeline',
    },
    {
      title: 'Lowest QA area',
      value: STAGE_LABELS[weakestQaStage?.stage ?? 'opening'],
      note: 'Open in Performance',
      tone: 'info',
      routePath: '/performance',
      routeLabel: 'Performance',
    },
  ]
}

function createWeeklySummary({
  weeklyLeads,
  previousWeeklyLeads,
  weeklyConfirmed,
  previousWeeklyConfirmed,
  weeklyQualifiedRate,
  previousWeeklyQualifiedRate,
  openThreads,
  needsAttentionCount,
}) {
  const weeklyConversionRate = weeklyLeads ? (weeklyConfirmed / weeklyLeads) * 100 : 0
  const previousWeeklyConversionRate = previousWeeklyLeads
    ? (previousWeeklyConfirmed / previousWeeklyLeads) * 100
    : 0

  return {
    title: 'This week in Inflow',
    primaryMetric: {
      label: 'Booked calls',
      numericValue: weeklyConfirmed,
      previousValue: previousWeeklyConfirmed,
      detail: `${weeklyLeads} new leads entered this week`,
      compact: true,
      delta: deltaMeta(weeklyConfirmed, previousWeeklyConfirmed),
    },
    tickers: [
      {
        label: 'Lead velocity',
        value: deltaMeta(weeklyLeads, previousWeeklyLeads).value,
        tone: deltaMeta(weeklyLeads, previousWeeklyLeads).tone,
      },
      {
        label: 'Qualified rate',
        value: deltaMeta(weeklyQualifiedRate, previousWeeklyQualifiedRate).value,
        tone: deltaMeta(weeklyQualifiedRate, previousWeeklyQualifiedRate).tone,
      },
      {
        label: 'Conversion rate',
        value: formatPercent(weeklyConversionRate, 1),
        tone: deltaMeta(weeklyConversionRate, previousWeeklyConversionRate).tone,
      },
      {
        label: 'Open conversations',
        value: `${openThreads}`,
        tone: 'info',
      },
      {
        label: 'Needs attention',
        value: `${needsAttentionCount}`,
        tone: needsAttentionCount > 10 ? 'warning' : 'positive',
      },
    ],
  }
}

export function getOverviewModel(
  dataset,
  clientId,
  rangeSelection = DEFAULT_DATE_RANGE,
  metricSlots = [],
) {
  const records = getClientRecords(dataset, clientId)
  const dailyFacts = getDailyFacts(dataset, clientId)
  const window = resolveWindow(rangeSelection)
  const previous = previousWindow(window)
  const weekWindow = resolveWindow('7D')
  const previousWeek = previousWindow(weekWindow)

  const cohortRecords = records.filter((record) =>
    isWithinWindow(record.lead.createdAt, window),
  )
  const previousCohortRecords = records.filter((record) =>
    isWithinWindow(record.lead.createdAt, previous),
  )

  const latestDailyFact = getLatestDailyFact(dailyFacts, window)
  const previousLatestDailyFact = getLatestDailyFact(dailyFacts, previous)
  const openThreadsCurrent = Number(latestDailyFact?.active_threads_eod ?? 0)
  const openThreadsPrevious = Number(previousLatestDailyFact?.active_threads_eod ?? 0)
  const stalledCurrent = Number(latestDailyFact?.stalled_threads ?? 0)
  const stalledPrevious = Number(previousLatestDailyFact?.stalled_threads ?? 0)
  const avgFirstResponseCurrent = weightedDailyAverage(
    dailyFacts,
    window,
    'avg_first_response_min',
    'inbound_messages',
  )
  const avgFirstResponsePrevious = weightedDailyAverage(
    dailyFacts,
    previous,
    'avg_first_response_min',
    'inbound_messages',
  )
  const avgReplyLatencyCurrent = weightedDailyAverage(
    dailyFacts,
    window,
    'avg_reply_latency_min',
    'replies_reviewed',
  )
  const avgReplyLatencyPrevious = weightedDailyAverage(
    dailyFacts,
    previous,
    'avg_reply_latency_min',
    'replies_reviewed',
  )
  const confirmedCallsCurrent = sumDailyField(dailyFacts, window, 'confirmed_calls')
  const confirmedCallsPrevious = sumDailyField(dailyFacts, previous, 'confirmed_calls')
  const closedWonCurrent = sumDailyField(dailyFacts, window, 'closed_won')
  const closedWonPrevious = sumDailyField(dailyFacts, previous, 'closed_won')
  const totalLeadsCurrent = sumDailyField(dailyFacts, window, 'total_new_leads')
  const totalLeadsPrevious = sumDailyField(dailyFacts, previous, 'total_new_leads')
  const qaCurrent = weightedDailyAverage(
    dailyFacts,
    window,
    'avg_review_score',
    'replies_reviewed',
  )
  const qaPrevious = weightedDailyAverage(
    dailyFacts,
    previous,
    'avg_review_score',
    'replies_reviewed',
  )
  const reviewedRepliesCurrent = sumDailyField(dailyFacts, window, 'replies_reviewed')
  const reviewedRepliesPrevious = sumDailyField(dailyFacts, previous, 'replies_reviewed')
  const approvedRepliesCurrent = sumDailyField(dailyFacts, window, 'replies_good')
  const approvedRepliesPrevious = sumDailyField(dailyFacts, previous, 'replies_good')
  const guardrailTouchesCurrent = sumDailyField(dailyFacts, window, 'guardrail_interventions')
  const guardrailTouchesPrevious = sumDailyField(dailyFacts, previous, 'guardrail_interventions')
  const upcomingCalls = getUpcomingCalls(records)
  const needsAttention = getAttentionItems(records)
  const qualifiedRecords = cohortRecords.filter((record) => record.qualification === 'qualified')
  const previousQualifiedRecords = previousCohortRecords.filter(
    (record) => record.qualification === 'qualified',
  )
  const unqualifiedRecords = cohortRecords.filter(
    (record) => record.qualification === 'unqualified',
  )
  const previousUnqualifiedRecords = previousCohortRecords.filter(
    (record) => record.qualification === 'unqualified',
  )
  const yesMaybeRecords = cohortRecords.filter((record) =>
    ['yes', 'maybe'].includes(record.bookingIntent),
  )
  const previousYesMaybeRecords = previousCohortRecords.filter((record) =>
    ['yes', 'maybe'].includes(record.bookingIntent),
  )
  const objectionRecordsCurrent = cohortRecords.filter(hasExplicitObjection)
  const objectionRecordsPrevious = previousCohortRecords.filter(hasExplicitObjection)
  const recoveredObjectionsCurrent = objectionRecordsCurrent.filter(isRecoveredObjection)
  const recoveredObjectionsPrevious = objectionRecordsPrevious.filter(isRecoveredObjection)
  const dropOffRecordsCurrent = cohortRecords.filter(isDropOffRecord)
  const dropOffRecordsPrevious = previousCohortRecords.filter(isDropOffRecord)
  const pipelineRecordsCurrent = getWindowRecords(records, window)
  const pipelineRecordsPrevious = records.filter((record) => {
    const candidates = [
      record.lead.createdAt,
      record.thread.lastMessageAt,
      record.thread.enteredStageAt,
      record.confirmedTime,
      record.callTime,
    ]

    return candidates.some((value) => isWithinWindow(value, previous))
  })
  const conversionRateCurrent = totalLeadsCurrent
    ? (closedWonCurrent / totalLeadsCurrent) * 100
    : 0
  const conversionRatePrevious = totalLeadsPrevious
    ? (closedWonPrevious / totalLeadsPrevious) * 100
    : 0
  const avgMessagesPerLeadCurrent = pipelineRecordsCurrent.length
    ? average(
      pipelineRecordsCurrent.map(
        (record) =>
          Number(record.leadFact.inbound_message_count ?? 0) +
          Number(record.leadFact.outbound_message_count ?? 0),
      ),
    )
    : 0
  const avgMessagesPerLeadPrevious = pipelineRecordsPrevious.length
    ? average(
      pipelineRecordsPrevious.map(
        (record) =>
          Number(record.leadFact.inbound_message_count ?? 0) +
          Number(record.leadFact.outbound_message_count ?? 0),
      ),
    )
    : 0
  const threadCloseRateCurrent = pipelineRecordsCurrent.length
    ? (pipelineRecordsCurrent.filter((record) => record.thread.threadClosed).length / pipelineRecordsCurrent.length) * 100
    : 0
  const threadCloseRatePrevious = pipelineRecordsPrevious.length
    ? (pipelineRecordsPrevious.filter((record) => record.thread.threadClosed).length / pipelineRecordsPrevious.length) * 100
    : 0
  const atRiskBookingsCurrent = sumDailyField(dailyFacts, window, 'at_risk_bookings')
  const atRiskBookingsPrevious = sumDailyField(dailyFacts, previous, 'at_risk_bookings')
  const attendedCurrent = sumDailyField(dailyFacts, window, 'attended')
  const attendedPrevious = sumDailyField(dailyFacts, previous, 'attended')
  const noShowCurrent = sumDailyField(dailyFacts, window, 'no_show')
  const noShowPrevious = sumDailyField(dailyFacts, previous, 'no_show')
  const attendanceBaseCurrent = attendedCurrent + noShowCurrent
  const attendanceBasePrevious = attendedPrevious + noShowPrevious
  const showRateCurrent = attendanceBaseCurrent ? (attendedCurrent / attendanceBaseCurrent) * 100 : 0
  const showRatePrevious = attendanceBasePrevious ? (attendedPrevious / attendanceBasePrevious) * 100 : 0
  const noShowRateCurrent = attendanceBaseCurrent ? (noShowCurrent / attendanceBaseCurrent) * 100 : 0
  const noShowRatePrevious = attendanceBasePrevious ? (noShowPrevious / attendanceBasePrevious) * 100 : 0
  const approvalRateCurrent = reviewedRepliesCurrent
    ? (approvedRepliesCurrent / reviewedRepliesCurrent) * 100
    : 0
  const approvalRatePrevious = reviewedRepliesPrevious
    ? (approvedRepliesPrevious / reviewedRepliesPrevious) * 100
    : 0
  const guardrailTouchRateCurrent = reviewedRepliesCurrent
    ? (guardrailTouchesCurrent / reviewedRepliesCurrent) * 100
    : 0
  const guardrailTouchRatePrevious = reviewedRepliesPrevious
    ? (guardrailTouchesPrevious / reviewedRepliesPrevious) * 100
    : 0
  const needsCoachingCurrent = pipelineRecordsCurrent.filter(
    (record) => getConversationHealthMeta(record).key !== 'healthy',
  ).length
  const needsCoachingPrevious = pipelineRecordsPrevious.filter(
    (record) => getConversationHealthMeta(record).key !== 'healthy',
  ).length

  const metricCatalog = {
    totalLeads: buildMetric({
      key: 'totalLeads',
      label: 'Total Leads',
      numericValue: totalLeadsCurrent,
      previousValue: totalLeadsPrevious,
      detail: `${cohortRecords.length} lead records in range`,
      routePath: '/leads',
      compact: true,
    }),
    pipelineLeads: buildMetric({
      key: 'pipelineLeads',
      label: 'Pipeline Leads',
      numericValue: pipelineRecordsCurrent.length,
      previousValue: pipelineRecordsPrevious.length,
      detail: 'Visible in the pipeline view',
      routePath: '/pipeline',
      compact: true,
    }),
    activeConversations: buildMetric({
      key: 'activeConversations',
      label: 'Open Threads',
      numericValue: openThreadsCurrent,
      previousValue: openThreadsPrevious,
      detail: 'Open conversations at range end',
      routePath: '/conversations',
      compact: true,
    }),
    qualifiedLeads: buildMetric({
      key: 'qualifiedLeads',
      label: 'Qualified Leads',
      numericValue: qualifiedRecords.length,
      previousValue: previousQualifiedRecords.length,
      detail: `${formatPercent(
        cohortRecords.length ? (qualifiedRecords.length / cohortRecords.length) * 100 : 0,
        0,
      )} qualification rate`,
      routePath: '/leads',
      compact: true,
    }),
    unqualifiedLeads: buildMetric({
      key: 'unqualifiedLeads',
      label: 'Unqualified Leads',
      numericValue: unqualifiedRecords.length,
      previousValue: previousUnqualifiedRecords.length,
      detail: 'Screened out by fit or readiness',
      routePath: '/leads',
      compact: true,
      invertTone: true,
    }),
    bookingIntent: buildMetric({
      key: 'bookingIntent',
      label: 'Booking Intent',
      numericValue: yesMaybeRecords.length,
      previousValue: previousYesMaybeRecords.length,
      detail: 'Yes or maybe toward a call',
      routePath: '/bookings',
      compact: true,
    }),
    confirmedCalls: buildMetric({
      key: 'confirmedCalls',
      label: 'Confirmed Calls',
      numericValue: confirmedCallsCurrent,
      previousValue: confirmedCallsPrevious,
      detail: `${upcomingCalls.length} upcoming now`,
      routePath: '/bookings',
      compact: true,
    }),
    conversionRate: buildMetric({
      key: 'conversionRate',
      label: 'Conversion Rate',
      numericValue: conversionRateCurrent,
      previousValue: conversionRatePrevious,
      detail: 'Closed won from new leads',
      routePath: '/pipeline',
      suffix: '%',
      decimals: 1,
    }),
    avgReplyQuality: buildMetric({
      key: 'avgReplyQuality',
      label: 'Reply Quality',
      numericValue: qaCurrent,
      previousValue: qaPrevious,
      detail: 'Weighted QA score',
      routePath: '/performance',
      suffix: '%',
      decimals: 0,
    }),
    avgFirstResponse: buildMetric({
      key: 'avgFirstResponse',
      label: 'First Reply Time',
      numericValue: avgFirstResponseCurrent,
      previousValue: avgFirstResponsePrevious,
      detail: 'Weighted by inbound volume',
      routePath: '/conversations',
      suffix: 'm',
      decimals: 0,
      invertTone: true,
    }),
    avgReplyLatency: buildMetric({
      key: 'avgReplyLatency',
      label: 'Reply Gap',
      numericValue: avgReplyLatencyCurrent,
      previousValue: avgReplyLatencyPrevious,
      detail: 'Average time between follow-ups',
      routePath: '/conversations',
      suffix: 'm',
      decimals: 0,
      invertTone: true,
    }),
    avgMessagesPerLead: buildMetric({
      key: 'avgMessagesPerLead',
      label: 'Messages / Lead',
      numericValue: avgMessagesPerLeadCurrent,
      previousValue: avgMessagesPerLeadPrevious,
      detail: 'Average thread depth in range',
      routePath: '/conversations',
      decimals: 1,
    }),
    threadCloseRate: buildMetric({
      key: 'threadCloseRate',
      label: 'Thread Close Rate',
      numericValue: threadCloseRateCurrent,
      previousValue: threadCloseRatePrevious,
      detail: 'Share of visible threads already closed',
      routePath: '/conversations',
      suffix: '%',
      decimals: 0,
    }),
    needsAttention: buildMetric({
      key: 'needsAttention',
      label: 'Needs Attention',
      numericValue: stalledCurrent,
      previousValue: stalledPrevious,
      detail: 'Threads flagged as stalled',
      routePath: '/pipeline',
      compact: true,
      invertTone: true,
    }),
    upcomingCalls: buildMetric({
      key: 'upcomingCalls',
      label: 'Upcoming Calls',
      numericValue: upcomingCalls.length,
      previousValue: records.filter((record) => {
        if (!record.callTime) {
          return false
        }

        const callAt = new Date(record.callTime).getTime()
        return callAt > previous.end.getTime() && callAt <= previous.end.getTime() + (14 * DAY)
      }).length,
      detail: 'Scheduled in the next 14 days',
      routePath: '/bookings',
      compact: true,
    }),
    objectionRate: buildMetric({
      key: 'objectionRate',
      label: 'Objection Rate',
      numericValue: cohortRecords.length
        ? (cohortRecords.filter((record) => record.objectionType !== 'none').length / cohortRecords.length) * 100
        : 0,
      previousValue: previousCohortRecords.length
        ? (previousCohortRecords.filter((record) => record.objectionType !== 'none').length / previousCohortRecords.length) * 100
        : 0,
      detail: 'Leads with explicit blockers',
      routePath: '/objections',
      suffix: '%',
      decimals: 1,
      invertTone: true,
    }),
    objectionRecoveryRate: buildMetric({
      key: 'objectionRecoveryRate',
      label: 'Objection Recovery',
      numericValue: objectionRecordsCurrent.length
        ? (recoveredObjectionsCurrent.length / objectionRecordsCurrent.length) * 100
        : 0,
      previousValue: objectionRecordsPrevious.length
        ? (recoveredObjectionsPrevious.length / objectionRecordsPrevious.length) * 100
        : 0,
      detail: 'Objection leads that still reached scheduling',
      routePath: '/objections',
      suffix: '%',
      decimals: 0,
    }),
    dropOffRate: buildMetric({
      key: 'dropOffRate',
      label: 'Drop-off Rate',
      numericValue: cohortRecords.length
        ? (dropOffRecordsCurrent.length / cohortRecords.length) * 100
        : 0,
      previousValue: previousCohortRecords.length
        ? (dropOffRecordsPrevious.length / previousCohortRecords.length) * 100
        : 0,
      detail: 'Leads stalling or closing before resolution',
      routePath: '/objections',
      suffix: '%',
      decimals: 0,
      invertTone: true,
    }),
    confirmedBookings: buildMetric({
      key: 'confirmedBookings',
      label: 'Confirmed Bookings',
      numericValue: confirmedCallsCurrent,
      previousValue: confirmedCallsPrevious,
      detail: 'Calls already locked into the calendar',
      routePath: '/bookings',
      compact: true,
    }),
    atRiskBookings: buildMetric({
      key: 'atRiskBookings',
      label: 'At-risk Bookings',
      numericValue: atRiskBookingsCurrent,
      previousValue: atRiskBookingsPrevious,
      detail: 'Scheduled or proposed calls needing attention',
      routePath: '/bookings',
      compact: true,
      invertTone: true,
    }),
    showRate: buildMetric({
      key: 'showRate',
      label: 'Show Rate',
      numericValue: showRateCurrent,
      previousValue: showRatePrevious,
      detail: 'Attended calls out of completed bookings',
      routePath: '/bookings',
      suffix: '%',
      decimals: 0,
    }),
    noShowRate: buildMetric({
      key: 'noShowRate',
      label: 'No-show Rate',
      numericValue: noShowRateCurrent,
      previousValue: noShowRatePrevious,
      detail: 'Missed calls out of completed bookings',
      routePath: '/bookings',
      suffix: '%',
      decimals: 0,
      invertTone: true,
    }),
    qaCoverage: buildMetric({
      key: 'qaCoverage',
      label: 'QA Coverage',
      numericValue: cohortRecords.length
        ? (cohortRecords.filter((record) => record.qaEvents.length > 0).length / cohortRecords.length) * 100
        : 0,
      previousValue: previousCohortRecords.length
        ? (previousCohortRecords.filter((record) => record.qaEvents.length > 0).length / previousCohortRecords.length) * 100
        : 0,
      detail: 'Lead records touched by review',
      routePath: '/performance',
      suffix: '%',
      decimals: 0,
    }),
    approvalRate: buildMetric({
      key: 'approvalRate',
      label: 'Approval Rate',
      numericValue: approvalRateCurrent,
      previousValue: approvalRatePrevious,
      detail: 'Reviewed replies marked good',
      routePath: '/performance',
      suffix: '%',
      decimals: 0,
    }),
    guardrailTouchRate: buildMetric({
      key: 'guardrailTouchRate',
      label: 'Guardrail Touch Rate',
      numericValue: guardrailTouchRateCurrent,
      previousValue: guardrailTouchRatePrevious,
      detail: 'Reviewed replies that triggered intervention',
      routePath: '/performance',
      suffix: '%',
      decimals: 0,
      invertTone: true,
    }),
    needsCoaching: buildMetric({
      key: 'needsCoaching',
      label: 'Needs Coaching',
      numericValue: needsCoachingCurrent,
      previousValue: needsCoachingPrevious,
      detail: 'Visible threads needing QA attention',
      routePath: '/performance',
      compact: true,
      invertTone: true,
    }),
  }

  const selectedMetricSlots = (
    metricSlots?.length ? metricSlots : Object.keys(metricCatalog).slice(0, 8)
  )
    .map((slotKey) => metricCatalog[slotKey])
    .filter(Boolean)

  const weeklyLeads = sumDailyField(dailyFacts, weekWindow, 'total_new_leads')
  const previousWeeklyLeads = sumDailyField(dailyFacts, previousWeek, 'total_new_leads')
  const weeklyConfirmed = sumDailyField(dailyFacts, weekWindow, 'confirmed_calls')
  const previousWeeklyConfirmed = sumDailyField(dailyFacts, previousWeek, 'confirmed_calls')
  const weeklyQualifiedLeads = records.filter(
    (record) =>
      isWithinWindow(record.lead.createdAt, weekWindow) &&
      record.qualification === 'qualified',
  ).length
  const previousWeeklyQualifiedLeads = records.filter(
    (record) =>
      isWithinWindow(record.lead.createdAt, previousWeek) &&
      record.qualification === 'qualified',
  ).length
  const weeklyQualifiedRate = weeklyLeads
    ? (weeklyQualifiedLeads / weeklyLeads) * 100
    : 0
  const previousWeeklyQualifiedRate = previousWeeklyLeads
    ? (previousWeeklyQualifiedLeads / previousWeeklyLeads) * 100
    : 0

  const funnelSeries = buildFunnelSeries(dailyFacts, window)

  const leadTrend = createTrendSeries(dailyFacts, window, 'total_new_leads')
  const bookingTrend = createTrendSeries(dailyFacts, window, 'confirmed_calls')
  const qualificationSeries = [
    {
      name: 'Qualified',
      value: qualifiedRecords.length,
      color: qualificationColors.qualified,
    },
    {
      name: 'Unqualified',
      value: unqualifiedRecords.length,
      color: qualificationColors.unqualified,
    },
    {
      name: 'Unclear',
      value: cohortRecords.filter((record) => record.qualification === 'unclear').length,
      color: qualificationColors.unclear,
    },
  ]
  const objectionTotals = getObjectionTotals(dailyFacts, window)
  const objectionSeries = Object.entries(objectionTotals)
    .map(([key, value]) => ({
      name: objectionLabels[key],
      value,
      color: objectionColors[key],
      routePath: '/objections',
    }))
    .sort((left, right) => right.value - left.value)
  const leadTrendCatalog = buildTrendSeriesCatalog(dailyFacts, window, [
    {
      key: 'total_new_leads',
      label: 'New leads',
      field: 'total_new_leads',
      color: 'var(--accent-blue)',
    },
    {
      key: 'new_leads_qualified',
      label: 'Qualified',
      field: 'new_leads_qualified',
      color: 'var(--accent-pink)',
    },
    {
      key: 'stalled_threads',
      label: 'Needs attention',
      field: 'stalled_threads',
      color: '#8be7c2',
    },
    {
      key: 'active_threads_eod',
      label: 'Open threads',
      field: 'active_threads_eod',
      color: 'var(--accent-violet)',
    },
  ])
  const bookingTrendCatalog = buildTrendSeriesCatalog(dailyFacts, window, [
    {
      key: 'confirmed_calls',
      label: 'Confirmed calls',
      field: 'confirmed_calls',
      color: 'var(--accent-blue)',
    },
    {
      key: 'proposed_calls',
      label: 'Proposed calls',
      field: 'proposed_calls',
      color: 'var(--accent-pink)',
    },
    {
      key: 'at_risk_bookings',
      label: 'At-risk',
      field: 'at_risk_bookings',
      color: '#8be7c2',
    },
    {
      key: 'booking_intent_yes',
      label: 'Intent yes',
      field: 'booking_intent_yes',
      color: 'var(--accent-violet)',
    },
  ])

  return {
    availableMetrics: Object.values(metricCatalog).map((metric) => ({
      key: metric.key,
      label: metric.label,
    })),
    kpis: selectedMetricSlots,
    summary: createWeeklySummary({
      weeklyLeads,
      previousWeeklyLeads,
      weeklyConfirmed,
      previousWeeklyConfirmed,
      weeklyQualifiedRate,
      previousWeeklyQualifiedRate,
      openThreads: openThreadsCurrent,
      needsAttentionCount: stalledCurrent,
    }),
    funnelSeries,
    leadTrend,
    leadTrendCatalog,
    bookingTrend,
    bookingTrendCatalog,
    qualificationSeries,
    objectionSeries,
    needsAttention,
    upcomingCalls,
    topIssues: getTopIssues(cohortRecords, objectionSeries, funnelSeries),
    rangeKey: window.key,
    rangeLabel: window.label,
  }
}

const stageTones = {
  opening: 'info',
  current: 'info',
  desired: 'positive',
  objection: 'warning',
  book: 'positive',
  confirmed: 'positive',
}

const stageColors = {
  opening: '#8f6dff',
  current: '#7c87ff',
  desired: '#73a1ff',
  objection: '#f49be3',
  book: '#8be7c2',
  confirmed: '#74c7ff',
}

const leadStatusCatalog = {
  active: { label: 'Active', tone: 'info' },
  needs_attention: { label: 'Needs attention', tone: 'warning' },
  scheduled: { label: 'Scheduled', tone: 'positive' },
  closed: { label: 'Closed', tone: 'neutral' },
}

const qualificationCatalog = {
  qualified: { label: 'Qualified', tone: 'positive', color: qualificationColors.qualified },
  unqualified: { label: 'Unqualified', tone: 'danger', color: qualificationColors.unqualified },
  unclear: { label: 'Unclear', tone: 'info', color: qualificationColors.unclear },
}

const goalColors = {
  side_income: '#8f6dff',
  replace_income: '#74c7ff',
  consistency: '#f49be3',
  skill_building: '#8be7c2',
  lifestyle_goal: '#b6a1ff',
  other: '#89b8ff',
}

const experienceColors = {
  beginner: '#8f6dff',
  some_experience: '#74c7ff',
  experienced: '#f49be3',
}

const commitmentColors = {
  high: '#8be7c2',
  medium: '#74c7ff',
  low: '#ffb8e6',
  unclear: '#89b8ff',
}

function humanizeValue(value) {
  if (!value) {
    return 'Unclear'
  }

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatShortDate(dateValue) {
  if (!dateValue) {
    return 'Not scheduled'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(toDateTime(dateValue))
}

function getDaysSince(dateValue) {
  if (!dateValue) {
    return 0
  }

  return Math.max(
    1,
    Math.round((REFERENCE_NOW.getTime() - toDateTime(dateValue).getTime()) / DAY),
  )
}

function getHoursSince(dateValue) {
  if (!dateValue) {
    return 0
  }

  return Math.max(
    1,
    Math.round((REFERENCE_NOW.getTime() - toDateTime(dateValue).getTime()) / HOUR),
  )
}

function getLeadStatusMeta(status) {
  return leadStatusCatalog[status] ?? leadStatusCatalog.active
}

function getQualificationMeta(qualification) {
  return qualificationCatalog[qualification] ?? qualificationCatalog.unclear
}

function getBookingStatusMeta(record) {
  if (record.bookingEvent.attendedCall) {
    return { label: 'Attended', tone: 'positive', rank: 0 }
  }

  if (record.bookingEvent.noShow) {
    return { label: 'No-show', tone: 'danger', rank: 1 }
  }

  if (record.confirmedTime && toDateTime(record.confirmedTime) > REFERENCE_NOW) {
    return { label: 'Confirmed', tone: 'positive', rank: 2 }
  }

  if (record.bookingEvent.proposedTime) {
    return { label: 'Proposed', tone: 'info', rank: 3 }
  }

  if (record.bookingIntent === 'yes') {
    return { label: 'Intent: yes', tone: 'positive', rank: 4 }
  }

  if (record.bookingIntent === 'maybe') {
    return { label: 'Intent: maybe', tone: 'warning', rank: 5 }
  }

  return { label: 'No booking', tone: 'neutral', rank: 6 }
}

function getPriorityMeta(record) {
  const stageAgeDays = getDaysSince(record.thread.enteredStageAt)
  const replyGapHours = getHoursSince(record.thread.lastMessageAt)

  if (
    record.lead.status === 'needs_attention' &&
    (record.qualification === 'qualified' || record.bookingIntent === 'yes')
  ) {
    return { label: 'Urgent', tone: 'danger', rank: 0 }
  }

  if (record.lead.status === 'needs_attention' || stageAgeDays >= 6 || replyGapHours >= 96) {
    return { label: 'High', tone: 'warning', rank: 1 }
  }

  if (
    record.bookingIntent === 'yes' ||
    (record.confirmedTime && toDateTime(record.confirmedTime) > REFERENCE_NOW)
  ) {
    return { label: 'Active', tone: 'positive', rank: 2 }
  }

  if (record.qualification === 'qualified') {
    return { label: 'Watch', tone: 'info', rank: 3 }
  }

  return { label: 'Routine', tone: 'neutral', rank: 4 }
}

function getWindowRecords(records, window) {
  if (window.selection.mode === 'custom' && window.days <= 0) {
    return []
  }

  if (window.selection.mode !== 'custom' && window.selection.preset === 'All Time') {
    return records
  }

  return records.filter((record) => {
    const candidates = [
      record.lead.createdAt,
      record.thread.lastMessageAt,
      record.thread.enteredStageAt,
      record.confirmedTime,
      record.callTime,
    ]

    return candidates.some((value) => isWithinWindow(value, window))
  })
}

function sortOptionValues(values) {
  return [...values].sort((left, right) => left.label.localeCompare(right.label))
}

function collectOptionCounts(rows, valueKey, labelKey) {
  const counts = new Map()

  rows.forEach((row) => {
    const value = row[valueKey]

    if (!value || value === 'none') {
      return
    }

    const entry = counts.get(value) ?? {
      value,
      label: labelKey ? row[labelKey] : humanizeValue(value),
      count: 0,
    }

    entry.count += 1
    counts.set(value, entry)
  })

  return sortOptionValues(Array.from(counts.values()))
}

function buildLeadRow(record) {
  const stageKey = record.thread.currentStage
  const stageLabel = STAGE_LABELS[stageKey] ?? humanizeValue(stageKey)
  const stageAgeDays = getDaysSince(record.thread.enteredStageAt)
  const qualificationMeta = getQualificationMeta(record.qualification)
  const bookingStatus = getBookingStatusMeta(record)
  const status = getLeadStatusMeta(record.lead.status)
  const priority = getPriorityMeta(record)
  const objectionLabel = record.objectionType === 'none'
    ? 'None'
    : objectionLabels[record.objectionType] ?? humanizeValue(record.objectionType)

  return {
    id: record.lead.id,
    displayName: record.lead.displayName,
    source: humanizeValue(record.lead.source),
    createdAt: record.lead.createdAt,
    createdLabel: formatShortDate(record.lead.createdAt),
    stageKey,
    stageLabel,
    stageTone: stageTones[stageKey] ?? 'neutral',
    stageColor: stageColors[stageKey] ?? '#89b8ff',
    stageAgeDays,
    stageAgeLabel: formatStageAge(record.thread.enteredStageAt),
    lastActivityAt: record.thread.lastMessageAt,
    lastActivityLabel: formatRelativeTime(record.thread.lastMessageAt),
    lastActivityDetail: formatDateTime(record.thread.lastMessageAt),
    avgReplyLatencyMinutes: Number(record.leadFact.avg_reply_latency_minutes ?? 0),
    qualificationKey: record.qualification,
    qualificationLabel: qualificationMeta.label,
    qualificationTone: qualificationMeta.tone,
    qualificationColor: qualificationMeta.color,
    bookingIntentKey: record.bookingIntent,
    bookingIntentLabel: humanizeValue(record.bookingIntent),
    bookingStatusLabel: bookingStatus.label,
    bookingStatusTone: bookingStatus.tone,
    bookingStatusRank: bookingStatus.rank,
    confirmedTime: record.confirmedTime,
    confirmedLabel: record.confirmedTime ? formatDateTime(record.confirmedTime) : 'Not scheduled',
    objectionKey: record.objectionType,
    objectionLabel,
    experienceKey: record.latestSnapshot.leadProfileJson.experience_level || 'unclear',
    experienceLabel: humanizeValue(record.latestSnapshot.leadProfileJson.experience_level),
    workRoleKey: record.latestSnapshot.leadProfileJson.work_role || 'unclear',
    workRoleLabel: humanizeValue(record.latestSnapshot.leadProfileJson.work_role),
    commitmentKey: record.latestSnapshot.leadProfileJson.commitment_level || 'unclear',
    commitmentLabel: humanizeValue(record.latestSnapshot.leadProfileJson.commitment_level),
    goalKey: record.latestSnapshot.leadProfileJson.goal_type || 'other',
    goalLabel: humanizeValue(record.latestSnapshot.leadProfileJson.goal_type || 'other'),
    statusLabel: status.label,
    statusTone: status.tone,
    priorityLabel: priority.label,
    priorityTone: priority.tone,
    priorityRank: priority.rank,
    routePath: '/leads',
    record,
  }
}

function buildLeadFacts(record) {
  const profile = record.latestSnapshot.leadProfileJson

  return [
    { label: 'Experience', value: humanizeValue(profile.experience_level) },
    { label: 'Work role', value: humanizeValue(profile.work_role) },
    { label: 'Commitment', value: humanizeValue(profile.commitment_level) },
    { label: 'Goal type', value: humanizeValue(profile.goal_type) },
    { label: 'Funding', value: humanizeValue(profile.funding_ability) },
    {
      label: 'Target outcome',
      value: profile.target_outcome_value ? `$${Number(profile.target_outcome_value).toLocaleString('en-US')}` : 'Not captured',
    },
    {
      label: 'Gap to target',
      value: profile.current_gap_to_target ? `$${Number(profile.current_gap_to_target).toLocaleString('en-US')}` : 'Not captured',
    },
    { label: 'Qualification', value: humanizeValue(profile.qualification_signal) },
    { label: 'Objection', value: humanizeValue(profile.objection_type === 'none' ? 'none' : profile.objection_type) },
  ]
}

function buildLeadTimeline(record) {
  const leadFact = record.leadFact
  const timeline = [
    {
      key: 'created',
      label: 'Lead created',
      date: leadFact.created_date,
      tone: 'info',
      detail: humanizeValue(leadFact.source_channel),
    },
    {
      key: 'opening',
      label: 'Opening',
      date: leadFact.opening_date || leadFact.created_date,
      tone: 'info',
      detail: 'First contact landed',
    },
    {
      key: 'current',
      label: 'Current state',
      date: leadFact.current_date,
      tone: 'info',
      detail: 'Context and baseline were clarified',
    },
    {
      key: 'desired',
      label: 'Desired state',
      date: leadFact.desired_date,
      tone: 'positive',
      detail: 'Target outcome and goals were discussed',
    },
    {
      key: 'objection',
      label: 'Objection',
      date: leadFact.objection_date,
      tone: 'warning',
      detail: leadFact.objection_type
        ? `${humanizeValue(normalizeObjectionType(leadFact.objection_type))} blocker surfaced`
        : 'A blocker surfaced',
    },
    {
      key: 'book',
      label: 'Booking intent',
      date: leadFact.book_date,
      tone: 'positive',
      detail: 'Call timing moved into scheduling',
    },
    {
      key: 'confirmed',
      label: 'Call confirmed',
      date: leadFact.confirmed_date,
      tone: 'positive',
      detail: 'Calendar slot was confirmed',
    },
    {
      key: 'call',
      label: 'Call held',
      date: leadFact.call_date,
      tone: leadFact.show_status === 'no_show' ? 'danger' : 'positive',
      detail: leadFact.show_status === 'no_show' ? 'Lead did not attend' : 'Call took place',
    },
    {
      key: 'close',
      label: 'Outcome logged',
      date: leadFact.close_date,
      tone: leadFact.final_status === 'won' ? 'positive' : 'neutral',
      detail: humanizeValue(leadFact.final_status || 'closed'),
    },
  ]

  return timeline
    .filter((item) => item.date)
    .map((item) => ({
      ...item,
      dateLabel: formatShortDate(item.date),
      sortValue: toDateTime(item.date).getTime(),
    }))
    .sort((left, right) => left.sortValue - right.sortValue)
}

function buildTranscriptPreview(record) {
  const role = humanizeValue(record.latestSnapshot.leadProfileJson.work_role).toLowerCase()
  const goal = humanizeValue(record.latestSnapshot.leadProfileJson.goal_type).toLowerCase()
  const currentStage = record.thread.currentStage
  const objection = record.objectionType !== 'none'
    ? humanizeValue(record.objectionType).toLowerCase()
    : ''

  return [
    {
      id: `${record.lead.id}-lead`,
      sender: 'Lead',
      tone: 'lead',
      text: `I'm a ${role} looking for ${goal}, and I want to understand whether this can realistically work for me.`,
    },
    {
      id: `${record.lead.id}-assistant-1`,
      sender: 'Inflow AI',
      tone: 'assistant',
      text: currentStage === 'opening'
        ? 'I can help map where you are now and what outcome you actually want before we talk about the next step.'
        : currentStage === 'current'
          ? 'Thanks for sharing the context. I want to narrow the gap between your current setup and the result you are aiming for.'
          : currentStage === 'desired'
            ? 'The goal is clear. The next move is making sure the plan and commitment level line up with the target outcome.'
            : currentStage === 'objection'
              ? `It sounds like ${objection || 'a blocker'} is the main hesitation, so I would address that directly before pushing for a booking.`
              : 'We are close to a decision point, so the next step is getting the right time locked in.',
    },
    {
      id: `${record.lead.id}-assistant-2`,
      sender: 'Inflow AI',
      tone: 'assistant',
      text: record.bookingEvent.confirmedTime
        ? `The conversation is now oriented around the confirmed call on ${formatShortDate(record.bookingEvent.confirmedTime)}.`
        : record.bookingIntent === 'yes'
          ? 'This lead has buying-in momentum, so the reply should be focused on timing and reducing booking friction.'
          : 'The safest next reply is a concise follow-up that keeps momentum without exposing internal process language.',
    },
  ]
}

function buildLatestApprovedReply(record) {
  const stage = record.thread.currentStage

  if (stage === 'opening') {
    return 'Open with one clear question that anchors on the lead’s current situation and what result they want next.'
  }

  if (stage === 'current') {
    return 'Reflect their situation back in plain language, then move into the gap between current reality and target outcome.'
  }

  if (stage === 'desired') {
    return 'Confirm the desired outcome, quantify what matters, and test whether their commitment matches the target.'
  }

  if (stage === 'objection') {
    return 'Name the blocker directly, resolve the concern with proof or framing, and then return to the booking path.'
  }

  return 'Use a scheduling-first reply that removes timezone friction and gives a clean path to confirmation.'
}

function buildNextStepSuggestion(record) {
  if (record.bookingEvent.confirmedTime && toDateTime(record.bookingEvent.confirmedTime) > REFERENCE_NOW) {
    return 'Send a short confirmation touchpoint and keep the thread warm until the scheduled call.'
  }

  if (record.bookingIntent === 'yes') {
    return 'Prioritize this lead for immediate scheduling follow-up and give a tighter time-choice prompt.'
  }

  if (record.thread.currentStage === 'objection') {
    return 'Resolve the blocker before asking for a booking again.'
  }

  if (record.lead.status === 'needs_attention') {
    return 'Re-open the thread with a concise follow-up tied to the last known goal or objection.'
  }

  return 'Advance the conversation one stage by asking the clearest next-stage question only.'
}

function buildLeadDetailSummary(row) {
  return [
    { label: 'Stage', value: row.stageLabel, tone: row.stageTone },
    { label: 'Stage age', value: row.stageAgeLabel, tone: 'neutral' },
    { label: 'Booking', value: row.bookingStatusLabel, tone: row.bookingStatusTone },
    { label: 'Priority', value: row.priorityLabel, tone: row.priorityTone },
  ]
}

function buildLeadDetailModelFromRecord(record) {
  const row = buildLeadRow(record)

  return {
    id: row.id,
    displayName: row.displayName,
    source: row.source,
    createdLabel: row.createdLabel,
    stage: { label: row.stageLabel, tone: row.stageTone, age: row.stageAgeLabel },
    status: { label: row.statusLabel, tone: row.statusTone },
    qualification: { label: row.qualificationLabel, tone: row.qualificationTone },
    bookingStatus: { label: row.bookingStatusLabel, tone: row.bookingStatusTone },
    priority: { label: row.priorityLabel, tone: row.priorityTone },
    summaryCards: buildLeadDetailSummary(row),
    facts: buildLeadFacts(record),
    timeline: buildLeadTimeline(record),
    transcriptPreview: buildTranscriptPreview(record),
    latestApprovedReply: buildLatestApprovedReply(record),
    nextStepSuggestion: buildNextStepSuggestion(record),
  }
}

function getConversationOutcomeMeta(record) {
  if (
    record.bookingEvent.attendedCall ||
    record.bookingEvent.noShow ||
    record.bookingEvent.proposedTime ||
    record.confirmedTime ||
    record.callTime
  ) {
    return { key: 'booked', label: 'Booked', tone: 'positive' }
  }

  if (record.thread.threadClosed) {
    return { key: 'closed', label: 'Closed', tone: 'neutral' }
  }

  if (record.lead.status === 'needs_attention') {
    return { key: 'stalled', label: 'Stalled', tone: 'warning' }
  }

  return { key: 'active', label: 'Active', tone: 'info' }
}

function getConversationHealthMeta(record) {
  const guardrailTouched = record.qaEvents.some((event) => event.guardrailChanged)
  const needsReview = record.qaEvents.some((event) => event.reviewVerdict !== 'good') ||
    record.reviewScore < 84

  if (guardrailTouched) {
    return { key: 'guardrail_touched', label: 'Guardrail-touched', tone: 'warning' }
  }

  if (needsReview) {
    return { key: 'needs_review', label: 'Needs review', tone: 'danger' }
  }

  return { key: 'healthy', label: 'Healthy', tone: 'positive' }
}

function getConversationCloseReasonMeta(record) {
  if (record.thread.threadCloseReason === 'closed_won') {
    return { key: 'booked', label: 'Booked', tone: 'positive' }
  }

  if (record.thread.threadCloseReason === 'no_show') {
    return { key: 'no_show', label: 'No-show', tone: 'danger' }
  }

  if (record.thread.threadCloseReason === 'closed_lost') {
    return { key: 'closed_lost', label: 'Closed after call', tone: 'neutral' }
  }

  if (record.thread.threadCloseReason === 'objection') {
    return { key: 'objection', label: 'Blocked by objection', tone: 'warning' }
  }

  if (!record.thread.threadClosed && record.lead.status === 'needs_attention') {
    return { key: 'natural_stop', label: 'Natural stop', tone: 'warning' }
  }

  return { key: 'controlled_close', label: 'Controlled close', tone: 'neutral' }
}

function buildConversationRow(record) {
  const leadRow = buildLeadRow(record)
  const outcome = getConversationOutcomeMeta(record)
  const health = getConversationHealthMeta(record)
  const closeReason = getConversationCloseReasonMeta(record)
  const transcriptPreview = buildTranscriptPreview(record)
  const messagesIn = Number(record.leadFact.inbound_message_count ?? 0)
  const messagesOut = Number(record.leadFact.outbound_message_count ?? 0)
  const firstResponseMinutes = Number(record.leadFact.first_response_minutes ?? 0)
  const avgReplyLatencyMinutes = Number(record.leadFact.avg_reply_latency_minutes ?? 0)

  return {
    ...leadRow,
    routePath: '/conversations',
    outcomeKey: outcome.key,
    outcomeLabel: outcome.label,
    outcomeTone: outcome.tone,
    outcomeColor: conversationOutcomeColors[outcome.key] ?? '#89b8ff',
    healthKey: health.key,
    healthLabel: health.label,
    healthTone: health.tone,
    healthColor: conversationHealthColors[health.key] ?? '#89b8ff',
    closeReasonKey: closeReason.key,
    closeReasonLabel: closeReason.label,
    closeReasonTone: closeReason.tone,
    closeReasonColor: conversationCloseReasonColors[closeReason.key] ?? '#89b8ff',
    messagesIn,
    messagesOut,
    messageCount: messagesIn + messagesOut,
    firstResponseMinutes,
    firstResponseLabel: firstResponseMinutes ? `${Math.round(firstResponseMinutes)} min` : 'No response',
    avgReplyLatencyMinutes,
    avgReplyLatencyLabel: avgReplyLatencyMinutes ? `${Math.round(avgReplyLatencyMinutes)} min` : 'No gap',
    transcriptPreview,
    previewText: transcriptPreview.at(-1)?.text ?? '',
    latestApprovedReply: buildLatestApprovedReply(record),
    nextStepSuggestion: buildNextStepSuggestion(record),
  }
}

function buildConversationSummary(rows, previousRows, dailyFacts, window, previousWindowValue) {
  const activeThreads = rows.filter((row) => row.outcomeKey === 'active').length
  const previousActiveThreads = previousRows.filter((row) => row.outcomeKey === 'active').length
  const avgMessagesPerLead = rows.length
    ? average(rows.map((row) => row.messageCount))
    : 0
  const previousAvgMessagesPerLead = previousRows.length
    ? average(previousRows.map((row) => row.messageCount))
    : 0
  const avgFirstReply = weightedDailyAverage(
    dailyFacts,
    window,
    'avg_first_response_min',
    'inbound_messages',
  )
  const previousAvgFirstReply = weightedDailyAverage(
    dailyFacts,
    previousWindowValue,
    'avg_first_response_min',
    'inbound_messages',
  )
  const avgReplyGap = weightedDailyAverage(
    dailyFacts,
    window,
    'avg_reply_latency_min',
    'replies_reviewed',
  )
  const previousAvgReplyGap = weightedDailyAverage(
    dailyFacts,
    previousWindowValue,
    'avg_reply_latency_min',
    'replies_reviewed',
  )
  const closeRate = rows.length
    ? (rows.filter((row) => row.record.thread.threadClosed).length / rows.length) * 100
    : 0
  const previousCloseRate = previousRows.length
    ? (previousRows.filter((row) => row.record.thread.threadClosed).length / previousRows.length) * 100
    : 0

  return [
    buildMetric({
      key: 'active-threads',
      label: 'Active Threads',
      numericValue: activeThreads,
      previousValue: previousActiveThreads,
      detail: 'Threads still moving in real time',
      routePath: '/conversations',
      compact: false,
    }),
    buildMetric({
      key: 'messages-per-lead',
      label: 'Avg Messages / Lead',
      numericValue: avgMessagesPerLead,
      previousValue: previousAvgMessagesPerLead,
      detail: 'Average inbound and outbound thread depth',
      routePath: '/conversations',
      decimals: 1,
    }),
    buildMetric({
      key: 'first-reply',
      label: 'Avg First Reply',
      numericValue: avgFirstReply,
      previousValue: previousAvgFirstReply,
      detail: 'Weighted by inbound message volume',
      routePath: '/conversations',
      suffix: 'm',
      invertTone: true,
    }),
    buildMetric({
      key: 'reply-gap',
      label: 'Avg Reply Gap',
      numericValue: avgReplyGap,
      previousValue: previousAvgReplyGap,
      detail: 'Average minutes between follow-ups',
      routePath: '/conversations',
      suffix: 'm',
      invertTone: true,
    }),
    buildMetric({
      key: 'close-rate',
      label: 'Thread Close Rate',
      numericValue: closeRate,
      previousValue: previousCloseRate,
      detail: 'Share of visible threads already closed',
      routePath: '/conversations',
      suffix: '%',
    }),
  ]
}

function buildMessageVolumeSeries(dailyFacts, range) {
  const { buckets } = createBuckets(range)

  return buckets.map((bucket) => ({
    label: bucket.label,
    inbound: sum(
      dailyFacts
        .filter((fact) => isWithinWindow(fact.date, bucket))
        .map((fact) => Number(fact.inbound_messages ?? 0)),
    ),
    outbound: sum(
      dailyFacts
        .filter((fact) => isWithinWindow(fact.date, bucket))
        .map((fact) => Number(fact.ai_messages_sent ?? 0)),
    ),
  }))
}

function buildTrendSeriesCatalog(dailyFacts, range, definitions) {
  return definitions.map((definition) => ({
    key: definition.key,
    label: definition.label,
    color: definition.color,
    data: createTrendSeries(dailyFacts, range, definition.field),
  }))
}

function buildConversationBreakdown(rows, keyField, labelField, colorField) {
  const counts = new Map()

  rows.forEach((row) => {
    const key = row[keyField]

    if (!key) {
      return
    }

    const entry = counts.get(key) ?? {
      key,
      name: row[labelField],
      value: 0,
      color: row[colorField] ?? '#89b8ff',
    }

    entry.value += 1
    counts.set(key, entry)
  })

  return Array.from(counts.values()).sort((left, right) => right.value - left.value)
}

function sortConversationRows(rows) {
  return [...rows].sort((left, right) => {
    if (left.outcomeKey !== right.outcomeKey) {
      const outcomeRank = {
        active: 0,
        booked: 1,
        stalled: 2,
        closed: 3,
      }

      return (outcomeRank[left.outcomeKey] ?? 99) - (outcomeRank[right.outcomeKey] ?? 99)
    }

    return new Date(right.lastActivityAt) - new Date(left.lastActivityAt)
  })
}

function buildConversationDetailModelFromRecord(record) {
  const row = buildConversationRow(record)

  return {
    id: row.id,
    displayName: row.displayName,
    source: row.source,
    createdLabel: row.createdLabel,
    stage: { label: row.stageLabel, tone: row.stageTone, age: row.stageAgeLabel },
    outcome: { label: row.outcomeLabel, tone: row.outcomeTone },
    health: { label: row.healthLabel, tone: row.healthTone },
    qualification: { label: row.qualificationLabel, tone: row.qualificationTone },
    bookingStatus: { label: row.bookingStatusLabel, tone: row.bookingStatusTone },
    closeReason: { label: row.closeReasonLabel, tone: row.closeReasonTone },
    summaryCards: [
      { label: 'Messages', value: `${row.messageCount}` },
      { label: 'First reply', value: row.firstResponseLabel },
      { label: 'Reply gap', value: row.avgReplyLatencyLabel },
      { label: 'Last activity', value: row.lastActivityLabel },
    ],
    facts: buildLeadFacts(record),
    timeline: buildLeadTimeline(record),
    transcriptPreview: row.transcriptPreview,
    latestApprovedReply: row.latestApprovedReply,
    nextStepSuggestion: row.nextStepSuggestion,
  }
}

function buildStageDistribution(rows) {
  const total = rows.length || 1

  return STAGE_ORDER.map((stage) => {
    const value = rows.filter((row) => row.stageKey === stage).length
    return {
      key: stage,
      label: STAGE_LABELS[stage],
      value,
      share: (value / total) * 100,
      color: stageColors[stage],
      tone: stageTones[stage],
    }
  })
}

function buildStageMovement(dailyFacts, window) {
  const opening = sumDailyField(dailyFacts, window, 'opening_entries')
  const current = sumDailyField(dailyFacts, window, 'current_entries')
  const desired = sumDailyField(dailyFacts, window, 'desired_entries')
  const objection = sumDailyField(dailyFacts, window, 'objection_entries')
  const book = sumDailyField(dailyFacts, window, 'book_entries')
  const confirmed = sumDailyField(dailyFacts, window, 'confirmed_calls')

  return {
    nodes: [
      { key: 'opening', label: 'Opening', value: opening, color: stageColors.opening },
      { key: 'current', label: 'Current', value: current, color: stageColors.current },
      { key: 'desired', label: 'Desired', value: desired, color: stageColors.desired },
      { key: 'book', label: 'Book', value: book, color: stageColors.book },
      { key: 'confirmed', label: 'Confirmed', value: confirmed, color: stageColors.confirmed },
    ],
    links: [
      {
        key: 'opening-current',
        label: 'Opening to Current',
        value: current,
        rate: opening ? (current / opening) * 100 : 0,
      },
      {
        key: 'current-desired',
        label: 'Current to Desired',
        value: desired,
        rate: current ? (desired / current) * 100 : 0,
      },
      {
        key: 'desired-book',
        label: 'Desired to Book',
        value: book,
        rate: desired ? (book / desired) * 100 : 0,
      },
      {
        key: 'book-confirmed',
        label: 'Book to Confirmed',
        value: Math.min(confirmed, book),
        rate: book ? (Math.min(confirmed, book) / book) * 100 : 0,
      },
    ],
    objectionDetour: {
      label: 'Objection detour',
      value: objection,
      rate: desired ? (objection / desired) * 100 : 0,
    },
  }
}

function buildAverageTimeInStage(rows) {
  return STAGE_ORDER.map((stage) => {
    const stageRows = rows.filter((row) => row.stageKey === stage)

    return {
      key: stage,
      label: STAGE_LABELS[stage],
      value: average(stageRows.map((row) => row.stageAgeDays)),
      color: stageColors[stage],
    }
  })
}

function buildResponseGapByStage(rows) {
  return STAGE_ORDER.map((stage) => {
    const stageRows = rows.filter((row) => row.stageKey === stage)

    return {
      key: stage,
      label: STAGE_LABELS[stage],
      value: average(stageRows.map((row) => row.avgReplyLatencyMinutes / (24 * 60))),
      color: stageColors[stage],
    }
  })
}

function buildCompletionRate(dailyFacts, window) {
  const opening = sumDailyField(dailyFacts, window, 'opening_entries')
  const current = sumDailyField(dailyFacts, window, 'current_entries')
  const desired = sumDailyField(dailyFacts, window, 'desired_entries')
  const book = sumDailyField(dailyFacts, window, 'book_entries')
  const confirmed = Math.min(sumDailyField(dailyFacts, window, 'confirmed_calls'), book)

  return [
    {
      key: 'opening-current',
      label: 'Opening to Current',
      value: opening ? (current / opening) * 100 : 0,
      color: stageColors.current,
    },
    {
      key: 'current-desired',
      label: 'Current to Desired',
      value: current ? (desired / current) * 100 : 0,
      color: stageColors.desired,
    },
    {
      key: 'desired-book',
      label: 'Desired to Book',
      value: desired ? (book / desired) * 100 : 0,
      color: stageColors.book,
    },
    {
      key: 'book-confirmed',
      label: 'Book to Confirmed',
      value: book ? (confirmed / book) * 100 : 0,
      color: stageColors.confirmed,
    },
  ]
}

function buildPipelineAlerts(rows, avgTimeInStage) {
  const stageNeedsAttention = STAGE_ORDER.map((stage) => ({
    stage,
    count: rows.filter(
      (row) => row.stageKey === stage && row.statusLabel === 'Needs attention',
    ).length,
  }))
  const bottleneck = [...avgTimeInStage].sort((left, right) => right.value - left.value)[0]
  const drift = [...stageNeedsAttention].sort((left, right) => right.count - left.count)[0]
  const fastMovers = rows
    .filter((row) => row.record.stageRank >= 2)
    .filter((row) => getDaysSince(row.createdAt) <= 14)
    .slice(0, 4)

  return [
    {
      key: 'bottleneck',
      label: 'Bottleneck',
      value: bottleneck?.label ?? 'Opening',
      detail: `${Math.round(bottleneck?.value ?? 0)} days average dwell`,
      tone: 'warning',
    },
    {
      key: 'fast-movers',
      label: 'Fast movers',
      value: `${fastMovers.length}`,
      detail: fastMovers.length
        ? fastMovers.map((row) => row.displayName).join(', ')
        : 'No rapid movers in range',
      tone: 'positive',
    },
    {
      key: 'stage-drift',
      label: 'Stage drift',
      value: STAGE_LABELS[drift?.stage ?? 'opening'],
      detail: `${drift?.count ?? 0} leads need intervention there`,
      tone: drift?.count ? 'danger' : 'info',
    },
  ]
}

function buildPipelineSummary(rows) {
  const qualified = rows.filter((row) => row.qualificationKey === 'qualified').length
  const needsAttention = rows.filter((row) => row.statusLabel === 'Needs attention').length
  const confirmed = rows.filter((row) => row.bookingStatusLabel === 'Confirmed').length

  return [
    {
      key: 'pipeline-leads',
      label: 'Pipeline Leads',
      value: rows.length,
      detail: 'Leads currently visible in this operational window',
      tone: 'info',
    },
    {
      key: 'qualified-leads',
      label: 'Qualified Leads',
      value: qualified,
      detail: rows.length
        ? `${formatPercent((qualified / rows.length) * 100, 0)} of visible pipeline`
        : 'No visible leads',
      tone: 'positive',
    },
    {
      key: 'needs-attention',
      label: 'Needs Attention',
      value: needsAttention,
      detail: 'Threads that need an intervention now',
      tone: 'warning',
    },
    {
      key: 'confirmed-calls',
      label: 'Confirmed Calls',
      value: confirmed,
      detail: 'Scheduled calls already locked in',
      tone: 'positive',
    },
  ]
}

function buildBreakdownSeries(rows, valueKey, labelKey, colors) {
  const counts = new Map()

  rows.forEach((row) => {
    const value = row[valueKey] || 'other'
    const label = labelKey ? row[labelKey] : humanizeValue(value)
    const count = counts.get(value) ?? {
      key: value,
      name: label,
      value: 0,
      color: colors?.[value] ?? '#89b8ff',
    }

    count.value += 1
    counts.set(value, count)
  })

  return Array.from(counts.values()).sort((left, right) => right.value - left.value)
}

function buildLeadPageSummary(rows) {
  const qualified = rows.filter((row) => row.qualificationKey === 'qualified').length
  const booked = rows.filter((row) => row.bookingStatusLabel === 'Confirmed').length
  const attention = rows.filter((row) => row.statusLabel === 'Needs attention').length
  const urgent = rows.filter((row) => row.priorityLabel === 'Urgent').length

  return [
    { key: 'records', label: 'Leads in view', value: rows.length, detail: 'Records matching the current range', tone: 'info' },
    { key: 'qualified', label: 'Qualified', value: qualified, detail: `${rows.length ? formatPercent((qualified / rows.length) * 100, 0) : '0%' } of visible leads`, tone: 'positive' },
    { key: 'booked', label: 'Confirmed', value: booked, detail: 'Call confirmations in visible set', tone: 'positive' },
    { key: 'attention', label: 'Needs attention', value: attention + urgent, detail: 'High-priority follow-up opportunities', tone: 'warning' },
  ]
}

function hasExplicitObjection(record) {
  return Boolean(record?.objectionType && record.objectionType !== 'none')
}

function getObjectionRecoveryDate(record) {
  if (!record?.leadFact?.objection_date) {
    return null
  }

  const objectionAt = toDateTime(record.leadFact.objection_date, { boundary: 'midday' })
  const recoveryCandidates = [
    record.leadFact.book_date,
    record.leadFact.confirmed_date,
    record.leadFact.call_date,
    record.leadFact.close_date,
  ]
    .filter(Boolean)
    .map((value) => toDateTime(value, { boundary: 'midday' }))
    .filter((value) => value && !Number.isNaN(value.getTime()))
    .filter((value) => value >= objectionAt)
    .sort((left, right) => left - right)

  return recoveryCandidates[0] ?? null
}

function isRecoveredObjection(record) {
  return Boolean(getObjectionRecoveryDate(record))
}

function isDropOffRecord(record) {
  if (record?.thread?.threadClosed && record.thread.threadCloseReason !== 'closed_won') {
    return true
  }

  return record?.lead?.status === 'needs_attention'
}

function sumObjectionFields(fact) {
  return (
    Number(fact.objection_time ?? 0) +
    Number(fact.objection_trust ?? 0) +
    Number(fact.objection_proof ?? 0) +
    Number(fact.objection_fit ?? 0) +
    Number(fact.objection_self_doubt ?? 0) +
    Number(fact.objection_price ?? 0) +
    Number(fact.objection_call ?? 0) +
    Number(fact.objection_other ?? 0)
  )
}

function buildObjectionDistributionSeries(dailyFacts, window) {
  const totals = getObjectionTotals(dailyFacts, window)

  return Object.entries(totals)
    .map(([key, value]) => ({
      key,
      name: objectionLabels[key] ?? humanizeValue(key),
      value,
      color: objectionColors[key] ?? '#89b8ff',
    }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value)
}

function buildObjectionTrendSeries(dailyFacts, range) {
  const { buckets } = createBuckets(range)

  return buckets.map((bucket) => ({
    label: bucket.label,
    value: sum(
      dailyFacts
        .filter((fact) => isWithinWindow(fact.date, bucket))
        .map(sumObjectionFields),
    ),
  }))
}

function buildDropOffByStage(records) {
  return STAGE_ORDER.map((stage) => {
    const matching = records.filter((record) => record.thread.currentStage === stage)

    return {
      key: stage,
      label: STAGE_LABELS[stage] ?? humanizeValue(stage),
      value: matching.length,
      color: stageColors[stage] ?? '#89b8ff',
      tone: stageTones[stage] ?? 'neutral',
    }
  }).filter((item) => item.value > 0)
}

function buildRecoveryByObjection(records) {
  const groups = new Map()

  records
    .filter(hasExplicitObjection)
    .forEach((record) => {
      const key = record.objectionType
      const entry = groups.get(key) ?? {
        key,
        name: objectionLabels[key] ?? humanizeValue(key),
        count: 0,
        recoveredCount: 0,
        color: objectionColors[key] ?? '#89b8ff',
      }

      entry.count += 1

      if (isRecoveredObjection(record)) {
        entry.recoveredCount += 1
      }

      groups.set(key, entry)
    })

  return Array.from(groups.values())
    .map((entry) => ({
      ...entry,
      value: entry.count ? (entry.recoveredCount / entry.count) * 100 : 0,
    }))
    .sort((left, right) => right.count - left.count)
}

function buildRecoveredObjectionExamples(records) {
  return records
    .filter(hasExplicitObjection)
    .filter(isRecoveredObjection)
    .map((record) => {
      const recoveredAt = getObjectionRecoveryDate(record)
      const objectionAt = toDateTime(record.leadFact.objection_date, { boundary: 'midday' })
      const recoveryDays = Math.max(
        1,
        Math.round((recoveredAt.getTime() - objectionAt.getTime()) / DAY),
      )

      return {
        id: `recovered-${record.lead.id}`,
        leadId: record.lead.id,
        displayName: record.lead.displayName,
        objectionLabel: objectionLabels[record.objectionType] ?? humanizeValue(record.objectionType),
        recoveredLabel: record.confirmedTime
          ? `Confirmed ${formatShortDate(record.confirmedTime)}`
          : record.bookingEvent.proposedTime
            ? `Moved to scheduling ${formatShortDate(record.bookingEvent.proposedTime)}`
            : `Recovered ${formatShortDate(recoveredAt)}`,
        note: `Recovered ${recoveryDays}d after the blocker surfaced`,
        statusTone: record.confirmedTime ? 'positive' : 'info',
      }
    })
    .sort((left, right) => {
      const leftDate = /(\w{3} \d{1,2}, \d{4})/.exec(left.recoveredLabel)
      const rightDate = /(\w{3} \d{1,2}, \d{4})/.exec(right.recoveredLabel)

      if (!leftDate || !rightDate) {
        return 0
      }

      return new Date(rightDate[1]) - new Date(leftDate[1])
    })
    .slice(0, 6)
}

function buildTopBlocker(distribution) {
  const [top] = distribution
  const total = distribution.reduce((sum, item) => sum + item.value, 0)

  if (!top) {
    return {
      label: 'Top blocker',
      value: 'No objections',
      detail: 'No explicit blockers were logged in this range.',
      tone: 'info',
    }
  }

  return {
    label: 'Top blocker',
    value: top.name,
    detail: `${top.value} objection moments (${formatPercent(total ? (top.value / total) * 100 : 0, 0)} share)`,
    tone: 'warning',
  }
}

function buildMostExpensiveBlocker(records) {
  const groups = new Map()

  records
    .filter(hasExplicitObjection)
    .forEach((record) => {
      const key = record.objectionType
      const currentGap = Number(record.latestSnapshot.leadProfileJson.current_gap_to_target ?? 0)
      const targetOutcome = Number(record.latestSnapshot.leadProfileJson.target_outcome_value ?? 0)
      const opportunityValue = currentGap || targetOutcome
      const entry = groups.get(key) ?? {
        key,
        label: objectionLabels[key] ?? humanizeValue(key),
        value: 0,
        count: 0,
      }

      entry.value += opportunityValue
      entry.count += 1
      groups.set(key, entry)
    })

  const top = Array.from(groups.values()).sort((left, right) => right.value - left.value)[0]

  if (!top) {
    return {
      label: 'Most expensive blocker',
      value: 'No blocker cost yet',
      detail: 'There is no objection value concentration in this window.',
      tone: 'info',
    }
  }

  return {
    label: 'Most expensive blocker',
    value: top.label,
    detail: `$${Math.round(top.value).toLocaleString('en-US')} of target gap across ${top.count} leads`,
    tone: 'danger',
  }
}

function buildBookingFunnelSeries(dailyFacts, window) {
  const rawStages = [
    {
      stage: 'Proposed',
      value: sumDailyField(dailyFacts, window, 'proposed_calls'),
      routePath: '/bookings',
    },
    {
      stage: 'Confirmed',
      value: sumDailyField(dailyFacts, window, 'confirmed_calls'),
      routePath: '/bookings',
    },
    {
      stage: 'Attended',
      value: sumDailyField(dailyFacts, window, 'attended'),
      routePath: '/bookings',
    },
  ]

  return rawStages.map((item, index) => {
    if (index === 0) {
      return item
    }

    const previousValue = rawStages[index - 1]?.value ?? item.value

    return {
      ...item,
      value: Math.min(item.value, previousValue),
    }
  })
}

function buildUpcomingBookingItems(records) {
  const upperBound = REFERENCE_NOW.getTime() + (14 * DAY)

  return records
    .filter((record) => record.callTime)
    .filter((record) => {
      const callAt = toDateTime(record.callTime).getTime()
      return callAt > REFERENCE_NOW.getTime() && callAt <= upperBound
    })
    .sort((left, right) => new Date(left.callTime) - new Date(right.callTime))
    .slice(0, 8)
    .map((record) => ({
      id: `upcoming-${record.lead.id}`,
      leadId: record.lead.id,
      displayName: record.lead.displayName,
      time: formatDateTime(record.callTime),
      relativeTime: formatRelativeTime(record.callTime),
      timezone: record.bookingEvent.timezone,
      note: record.confirmedTime ? 'Confirmed and ready' : 'Call slot is being held',
      tone: 'positive',
    }))
}

function buildAtRiskBookingItems(records) {
  return records
    .map((record) => {
      if (record.bookingEvent.proposedTime && !record.confirmedTime) {
        return {
          id: `risk-${record.lead.id}`,
          leadId: record.lead.id,
          displayName: record.lead.displayName,
          time: formatDateTime(record.bookingEvent.proposedTime),
          relativeTime: formatRelativeTime(record.bookingEvent.proposedTime),
          reason: 'Waiting on confirmation',
          note: 'The slot is proposed but the lead has not locked it in yet.',
          tone: 'warning',
        }
      }

      if (
        record.confirmedTime &&
        toDateTime(record.confirmedTime) > REFERENCE_NOW &&
        record.lead.status === 'needs_attention'
      ) {
        return {
          id: `risk-${record.lead.id}`,
          leadId: record.lead.id,
          displayName: record.lead.displayName,
          time: formatDateTime(record.confirmedTime),
          relativeTime: formatRelativeTime(record.confirmedTime),
          reason: 'Needs pre-call warm-up',
          note: 'The booking is confirmed, but the thread needs a reminder touchpoint.',
          tone: 'warning',
        }
      }

      if (record.bookingIntent === 'yes' && !record.confirmedTime) {
        return {
          id: `risk-${record.lead.id}`,
          leadId: record.lead.id,
          displayName: record.lead.displayName,
          time: record.thread.lastMessageAt ? formatDateTime(record.thread.lastMessageAt) : 'No recent reply',
          relativeTime: record.thread.lastMessageAt ? formatRelativeTime(record.thread.lastMessageAt) : 'Needs action',
          reason: 'High intent, no slot locked',
          note: 'The lead wants a call, but scheduling has not been finalized.',
          tone: 'danger',
        }
      }

      if (record.bookingIntent === 'maybe' && record.thread.currentStage === 'book') {
        return {
          id: `risk-${record.lead.id}`,
          leadId: record.lead.id,
          displayName: record.lead.displayName,
          time: record.thread.lastMessageAt ? formatDateTime(record.thread.lastMessageAt) : 'Recent touch',
          relativeTime: record.thread.lastMessageAt ? formatRelativeTime(record.thread.lastMessageAt) : 'Recent touch',
          reason: 'Timing friction',
          note: 'The lead is close, but timing questions are still unresolved.',
          tone: 'info',
        }
      }

      return null
    })
    .filter(Boolean)
    .sort((left, right) => {
      const toneRank = {
        danger: 0,
        warning: 1,
        info: 2,
      }

      if ((toneRank[left.tone] ?? 99) !== (toneRank[right.tone] ?? 99)) {
        return (toneRank[left.tone] ?? 99) - (toneRank[right.tone] ?? 99)
      }

      return left.relativeTime.localeCompare(right.relativeTime)
    })
    .slice(0, 8)
}

function buildBookingFrictionSummary(items) {
  const grouped = new Map()

  items.forEach((item) => {
    const entry = grouped.get(item.reason) ?? {
      key: item.reason,
      title: item.reason,
      count: 0,
      tone: item.tone,
      note: item.note,
    }

    entry.count += 1
    grouped.set(item.reason, entry)
  })

  return Array.from(grouped.values()).sort((left, right) => right.count - left.count)
}

function buildAttendanceSeries(dailyFacts, window, upcomingCount) {
  return [
    {
      key: 'attended',
      name: 'Attended',
      value: sumDailyField(dailyFacts, window, 'attended'),
      color: '#8be7c2',
    },
    {
      key: 'no_show',
      name: 'No-show',
      value: sumDailyField(dailyFacts, window, 'no_show'),
      color: '#ff8bb9',
    },
    {
      key: 'upcoming',
      name: 'Upcoming',
      value: upcomingCount,
      color: '#89b8ff',
    },
  ].filter((item) => item.value > 0)
}

function buildVerdictDistribution(dailyFacts, window) {
  return [
    {
      key: 'approved',
      name: 'Approved',
      value: sumDailyField(dailyFacts, window, 'replies_good'),
      color: '#74c7ff',
    },
    {
      key: 'needs_adjustment',
      name: 'Needs adjustment',
      value: sumDailyField(dailyFacts, window, 'replies_minor_risk'),
      color: '#8f6dff',
    },
    {
      key: 'misaligned',
      name: 'Misaligned',
      value: sumDailyField(dailyFacts, window, 'replies_misaligned'),
      color: '#f49be3',
    },
  ].filter((item) => item.value > 0)
}

function buildQualityByStage(rows) {
  return STAGE_ORDER.map((stage) => {
    const stageRows = rows.filter((row) => row.stageKey === stage && row.record.reviewScore > 0)

    return {
      key: stage,
      label: STAGE_LABELS[stage] ?? humanizeValue(stage),
      value: average(stageRows.map((row) => row.record.reviewScore)),
      count: stageRows.length,
      color: stageColors[stage] ?? '#89b8ff',
    }
  }).filter((item) => item.count > 0)
}

function buildPerformanceReviewSeries(dailyFacts, window) {
  return createMultiFieldTrendSeries(dailyFacts, window, [
    {
      key: 'reviewed',
      field: 'replies_reviewed',
    },
    {
      key: 'guardrail',
      field: 'guardrail_interventions',
    },
  ])
}

function buildCoachingQueue(records) {
  return records
    .map((record) => {
      const row = buildLeadRow(record)
      const health = getConversationHealthMeta(record)

      if (health.key === 'healthy') {
        return null
      }

      const reviewVerdict = record.qaEvents.at(-1)?.reviewVerdict ?? 'good'
      const note = health.key === 'guardrail_touched'
        ? 'Guardrail changed the latest approved reply.'
        : reviewVerdict === 'misaligned'
          ? 'Reply framing needs a stronger reset before reuse.'
          : 'Reply needs a quick polish pass before re-use.'

      return {
        id: row.id,
        leadId: row.id,
        displayName: row.displayName,
        stageLabel: row.stageLabel,
        stageTone: row.stageTone,
        healthLabel: health.label,
        healthTone: health.tone,
        reviewScore: Math.round(record.reviewScore || 0),
        reviewVerdict,
        reviewLabel: record.reviewScore ? `${Math.round(record.reviewScore)}%` : 'No score',
        lastActivityAt: row.lastActivityAt,
        lastActivityLabel: row.lastActivityLabel,
        note,
        priorityRank: health.key === 'guardrail_touched' ? 0 : reviewVerdict === 'misaligned' ? 1 : 2,
      }
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (left.priorityRank !== right.priorityRank) {
        return left.priorityRank - right.priorityRank
      }

      if (left.reviewScore !== right.reviewScore) {
        return left.reviewScore - right.reviewScore
      }

      return new Date(right.lastActivityAt) - new Date(left.lastActivityAt)
    })
    .slice(0, 8)
}

function buildCorrectionThemes(dailyFacts, window) {
  return [
    {
      key: 'misaligned',
      title: 'Misaligned framing',
      count: sumDailyField(dailyFacts, window, 'replies_misaligned'),
      tone: 'danger',
      note: 'Replies that need a clearer reset before they move the thread forward.',
    },
    {
      key: 'minor_risk',
      title: 'Needs adjustment',
      count: sumDailyField(dailyFacts, window, 'replies_minor_risk'),
      tone: 'warning',
      note: 'Close to usable, but still needs clarity or tone cleanup.',
    },
    {
      key: 'guardrail',
      title: 'Guardrail touches',
      count: sumDailyField(dailyFacts, window, 'guardrail_interventions'),
      tone: 'info',
      note: 'Responses that touched policy or reliability boundaries.',
    },
  ]
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count)
}

function buildStrongestPerformingSegment(rows) {
  const segmentCandidates = [
    ...collectOptionCounts(rows, 'stageKey', 'stageLabel').map((option) => ({
      key: `stage:${option.value}`,
      label: `${option.label} stage`,
      rows: rows.filter((row) => row.stageKey === option.value && row.record.reviewScore > 0),
    })),
    ...collectOptionCounts(rows, 'experienceKey', 'experienceLabel').map((option) => ({
      key: `experience:${option.value}`,
      label: `${option.label} leads`,
      rows: rows.filter((row) => row.experienceKey === option.value && row.record.reviewScore > 0),
    })),
  ]
    .map((segment) => ({
      ...segment,
      count: segment.rows.length,
      score: average(segment.rows.map((row) => row.record.reviewScore)),
    }))
    .filter((segment) => segment.count >= 3)
    .sort((left, right) => right.score - left.score)

  const winner = segmentCandidates[0]

  if (!winner) {
    return {
      label: 'No stable performance segment yet',
      value: 'Waiting on more reviewed volume',
      detail: 'This view will highlight the strongest segment once more reviewed replies accumulate.',
      tone: 'info',
    }
  }

  return {
    label: winner.label,
    value: `${Math.round(winner.score)}% avg QA`,
    detail: `${winner.count} reviewed leads in the current window`,
    tone: 'positive',
  }
}

function sortRowsByOperationalPriority(rows) {
  return [...rows].sort((left, right) => {
    if (left.priorityRank !== right.priorityRank) {
      return left.priorityRank - right.priorityRank
    }

    if (left.stageAgeDays !== right.stageAgeDays) {
      return right.stageAgeDays - left.stageAgeDays
    }

    return new Date(right.lastActivityAt) - new Date(left.lastActivityAt)
  })
}

export function getLeadDetailModel(dataset, clientId, leadId) {
  if (!leadId) {
    return null
  }

  const record = getClientRecords(dataset, clientId).find((item) => item.lead.id === leadId)

  if (!record) {
    return null
  }

  return buildLeadDetailModelFromRecord(record)
}

export function getConversationDetailModel(dataset, clientId, leadId) {
  if (!leadId) {
    return null
  }

  const record = getClientRecords(dataset, clientId).find((item) => item.lead.id === leadId)

  if (!record) {
    return null
  }

  return buildConversationDetailModelFromRecord(record)
}

export function getConversationsModel(
  dataset,
  clientId,
  rangeSelection = DEFAULT_DATE_RANGE,
) {
  const records = getClientRecords(dataset, clientId)
  const dailyFacts = getDailyFacts(dataset, clientId)
  const window = resolveWindow(rangeSelection)
  const previous = previousWindow(window)
  const visibleRecords = getWindowRecords(records, window)
  const previousVisibleRecords = records.filter((record) => {
    const candidates = [
      record.lead.createdAt,
      record.thread.lastMessageAt,
      record.thread.enteredStageAt,
      record.confirmedTime,
      record.callTime,
    ]

    return candidates.some((value) => isWithinWindow(value, previous))
  })
  const rows = sortConversationRows(visibleRecords.map(buildConversationRow))
  const previousRows = sortConversationRows(previousVisibleRecords.map(buildConversationRow))
  const closeReasonRows = rows.filter(
    (row) => row.closeReasonKey !== 'controlled_close' || row.record.thread.threadClosed,
  )

  return {
    summaryCards: buildConversationSummary(rows, previousRows, dailyFacts, window, previous),
    rows,
    volumeSeries: buildMessageVolumeSeries(dailyFacts, window),
    outcomeSeries: buildConversationBreakdown(rows, 'outcomeKey', 'outcomeLabel', 'outcomeColor'),
    closeReasonSeries: buildConversationBreakdown(
      closeReasonRows,
      'closeReasonKey',
      'closeReasonLabel',
      'closeReasonColor',
    ),
    filterOptions: {
      outcomes: collectOptionCounts(rows, 'outcomeKey', 'outcomeLabel'),
      healthStates: collectOptionCounts(rows, 'healthKey', 'healthLabel'),
      stages: collectOptionCounts(rows, 'stageKey', 'stageLabel'),
    },
    rangeLabel: window.label,
    rangeKey: window.key,
  }
}

export function getPipelineModel(
  dataset,
  clientId,
  rangeSelection = DEFAULT_DATE_RANGE,
) {
  const records = getClientRecords(dataset, clientId)
  const dailyFacts = getDailyFacts(dataset, clientId)
  const window = resolveWindow(rangeSelection)
  const visibleRecords = getWindowRecords(records, window)
  const rows = sortRowsByOperationalPriority(visibleRecords.map(buildLeadRow))
  const avgTimeInStage = buildAverageTimeInStage(rows)
  const responseGapByStage = buildResponseGapByStage(rows)

  return {
    summaryCards: buildPipelineSummary(rows),
    alerts: buildPipelineAlerts(rows, avgTimeInStage),
    stageDistribution: buildStageDistribution(rows),
    stageMovement: buildStageMovement(dailyFacts, window),
    avgTimeInStage,
    responseGapByStage,
    completionRate: buildCompletionRate(dailyFacts, window),
    rows,
    filterOptions: {
      stages: collectOptionCounts(rows, 'stageKey', 'stageLabel'),
      qualifications: collectOptionCounts(rows, 'qualificationKey', 'qualificationLabel'),
      objections: collectOptionCounts(rows, 'objectionKey', 'objectionLabel'),
      bookingStatuses: collectOptionCounts(rows, 'bookingStatusLabel'),
    },
    rangeLabel: window.label,
    rangeKey: window.key,
  }
}

export function getLeadsModel(
  dataset,
  clientId,
  rangeSelection = DEFAULT_DATE_RANGE,
) {
  const records = getClientRecords(dataset, clientId)
  const window = resolveWindow(rangeSelection)
  const visibleRecords = getWindowRecords(records, window)
  const rows = sortRowsByOperationalPriority(visibleRecords.map(buildLeadRow))

  return {
    summaryCards: buildLeadPageSummary(rows),
    rows,
    qualityMix: buildBreakdownSeries(rows, 'qualificationKey', 'qualificationLabel', qualificationColors),
    goalMix: buildBreakdownSeries(rows, 'goalKey', 'goalLabel', goalColors),
    experienceMix: buildBreakdownSeries(rows, 'experienceKey', 'experienceLabel', experienceColors),
    commitmentMix: buildBreakdownSeries(rows, 'commitmentKey', 'commitmentLabel', commitmentColors),
    filterOptions: {
      stages: collectOptionCounts(rows, 'stageKey', 'stageLabel'),
      qualifications: collectOptionCounts(rows, 'qualificationKey', 'qualificationLabel'),
      bookingIntents: collectOptionCounts(rows, 'bookingIntentKey', 'bookingIntentLabel'),
      objections: collectOptionCounts(rows, 'objectionKey', 'objectionLabel'),
      experienceLevels: collectOptionCounts(rows, 'experienceKey', 'experienceLabel'),
      goalTypes: collectOptionCounts(rows, 'goalKey', 'goalLabel'),
    },
    rangeLabel: window.label,
    rangeKey: window.key,
  }
}

export function getObjectionsModel(
  dataset,
  clientId,
  rangeSelection = DEFAULT_DATE_RANGE,
) {
  const records = getClientRecords(dataset, clientId)
  const dailyFacts = getDailyFacts(dataset, clientId)
  const window = resolveWindow(rangeSelection)
  const previous = previousWindow(window)
  const visibleRecords = getWindowRecords(records, window)
  const previousVisibleRecords = records.filter((record) => {
    const candidates = [
      record.lead.createdAt,
      record.thread.lastMessageAt,
      record.thread.enteredStageAt,
      record.confirmedTime,
      record.callTime,
    ]

    return candidates.some((value) => isWithinWindow(value, previous))
  })
  const objectionRecords = visibleRecords.filter(hasExplicitObjection)
  const previousObjectionRecords = previousVisibleRecords.filter(hasExplicitObjection)
  const recoveredRecords = objectionRecords.filter(isRecoveredObjection)
  const previousRecoveredRecords = previousObjectionRecords.filter(isRecoveredObjection)
  const dropOffRecords = visibleRecords.filter(isDropOffRecord)
  const previousDropOffRecords = previousVisibleRecords.filter(isDropOffRecord)
  const distribution = buildObjectionDistributionSeries(dailyFacts, window)
  const previousDistribution = buildObjectionDistributionSeries(dailyFacts, previous)
  const topBlockerShareCurrent = distribution.length
    ? (distribution[0].value / distribution.reduce((sum, item) => sum + item.value, 0)) * 100
    : 0
  const topBlockerSharePrevious = previousDistribution.length
    ? (previousDistribution[0].value / previousDistribution.reduce((sum, item) => sum + item.value, 0)) * 100
    : 0

  return {
    summaryCards: [
      buildMetric({
        key: 'leads-with-objections',
        label: 'Leads With Objections',
        numericValue: objectionRecords.length,
        previousValue: previousObjectionRecords.length,
        detail: visibleRecords.length
          ? `${formatPercent((objectionRecords.length / visibleRecords.length) * 100, 0)} of visible leads`
          : 'No visible leads in range',
        routePath: '/objections',
        compact: true,
      }),
      buildMetric({
        key: 'objection-recovery-rate',
        label: 'Recovery Rate',
        numericValue: objectionRecords.length
          ? (recoveredRecords.length / objectionRecords.length) * 100
          : 0,
        previousValue: previousObjectionRecords.length
          ? (previousRecoveredRecords.length / previousObjectionRecords.length) * 100
          : 0,
        detail: 'Objection leads that still reached scheduling',
        routePath: '/objections',
        suffix: '%',
      }),
      buildMetric({
        key: 'drop-off-rate',
        label: 'Drop-off Rate',
        numericValue: visibleRecords.length
          ? (dropOffRecords.length / visibleRecords.length) * 100
          : 0,
        previousValue: previousVisibleRecords.length
          ? (previousDropOffRecords.length / previousVisibleRecords.length) * 100
          : 0,
        detail: 'Visible leads slowing down or closing before resolution',
        routePath: '/objections',
        suffix: '%',
        invertTone: true,
      }),
      buildMetric({
        key: 'top-blocker-share',
        label: 'Top Blocker Share',
        numericValue: topBlockerShareCurrent,
        previousValue: topBlockerSharePrevious,
        detail: distribution[0]
          ? `${distribution[0].name} is the dominant blocker`
          : 'No objection concentration yet',
        routePath: '/objections',
        suffix: '%',
      }),
    ],
    distribution,
    trendSeries: buildObjectionTrendSeries(dailyFacts, window),
    dropOffByStage: buildDropOffByStage(dropOffRecords),
    recoveryByType: buildRecoveryByObjection(visibleRecords),
    topBlocker: buildTopBlocker(distribution),
    expensiveBlocker: buildMostExpensiveBlocker(objectionRecords),
    recoveredExamples: buildRecoveredObjectionExamples(visibleRecords),
    rangeLabel: window.label,
    rangeKey: window.key,
  }
}

export function getBookingsModel(
  dataset,
  clientId,
  rangeSelection = DEFAULT_DATE_RANGE,
) {
  const records = getClientRecords(dataset, clientId)
  const dailyFacts = getDailyFacts(dataset, clientId)
  const window = resolveWindow(rangeSelection)
  const previous = previousWindow(window)
  const visibleRecords = getWindowRecords(records, window)
  const previousVisibleRecords = records.filter((record) => {
    const candidates = [
      record.lead.createdAt,
      record.thread.lastMessageAt,
      record.thread.enteredStageAt,
      record.confirmedTime,
      record.callTime,
    ]

    return candidates.some((value) => isWithinWindow(value, previous))
  })
  const confirmedCurrent = sumDailyField(dailyFacts, window, 'confirmed_calls')
  const confirmedPrevious = sumDailyField(dailyFacts, previous, 'confirmed_calls')
  const attendedCurrent = sumDailyField(dailyFacts, window, 'attended')
  const attendedPrevious = sumDailyField(dailyFacts, previous, 'attended')
  const noShowCurrent = sumDailyField(dailyFacts, window, 'no_show')
  const noShowPrevious = sumDailyField(dailyFacts, previous, 'no_show')
  const attendanceBaseCurrent = attendedCurrent + noShowCurrent
  const attendanceBasePrevious = attendedPrevious + noShowPrevious
  const showRateCurrent = attendanceBaseCurrent ? (attendedCurrent / attendanceBaseCurrent) * 100 : 0
  const showRatePrevious = attendanceBasePrevious ? (attendedPrevious / attendanceBasePrevious) * 100 : 0
  const noShowRateCurrent = attendanceBaseCurrent ? (noShowCurrent / attendanceBaseCurrent) * 100 : 0
  const noShowRatePrevious = attendanceBasePrevious ? (noShowPrevious / attendanceBasePrevious) * 100 : 0
  const atRiskCurrent = sumDailyField(dailyFacts, window, 'at_risk_bookings')
  const atRiskPrevious = sumDailyField(dailyFacts, previous, 'at_risk_bookings')
  const upcomingBookings = buildUpcomingBookingItems(records)
  const atRiskBookings = buildAtRiskBookingItems(records)
  const frictionSummary = buildBookingFrictionSummary(atRiskBookings)

  return {
    summaryCards: [
      buildMetric({
        key: 'confirmed-calls',
        label: 'Confirmed Calls',
        numericValue: confirmedCurrent,
        previousValue: confirmedPrevious,
        detail: `${upcomingBookings.length} upcoming now`,
        routePath: '/bookings',
        compact: true,
      }),
      buildMetric({
        key: 'booking-rate',
        label: 'Booking Rate',
        numericValue: visibleRecords.length
          ? (confirmedCurrent / visibleRecords.length) * 100
          : 0,
        previousValue: previousVisibleRecords.length
          ? (confirmedPrevious / previousVisibleRecords.length) * 100
          : 0,
        detail: 'Confirmed calls from visible leads',
        routePath: '/bookings',
        suffix: '%',
      }),
      buildMetric({
        key: 'show-rate',
        label: 'Show Rate',
        numericValue: showRateCurrent,
        previousValue: showRatePrevious,
        detail: 'Attended calls out of completed bookings',
        routePath: '/bookings',
        suffix: '%',
      }),
      buildMetric({
        key: 'no-show-rate',
        label: 'No-show Rate',
        numericValue: noShowRateCurrent,
        previousValue: noShowRatePrevious,
        detail: `${atRiskCurrent} at-risk bookings flagged in range`,
        routePath: '/bookings',
        suffix: '%',
        invertTone: true,
      }),
    ],
    funnelSeries: buildBookingFunnelSeries(dailyFacts, window),
    confirmedTrend: createTrendSeries(dailyFacts, window, 'confirmed_calls'),
    upcomingBookings,
    atRiskBookings,
    attendanceSeries: buildAttendanceSeries(dailyFacts, window, upcomingBookings.length),
    frictionSummary,
    atRiskDelta: deltaMeta(atRiskCurrent, atRiskPrevious, true),
    rangeLabel: window.label,
    rangeKey: window.key,
  }
}

export function getPerformanceModel(
  dataset,
  clientId,
  rangeSelection = DEFAULT_DATE_RANGE,
) {
  const records = getClientRecords(dataset, clientId)
  const dailyFacts = getDailyFacts(dataset, clientId)
  const window = resolveWindow(rangeSelection)
  const previous = previousWindow(window)
  const visibleRecords = getWindowRecords(records, window)
  const previousVisibleRecords = records.filter((record) => {
    const candidates = [
      record.lead.createdAt,
      record.thread.lastMessageAt,
      record.thread.enteredStageAt,
      record.confirmedTime,
      record.callTime,
    ]

    return candidates.some((value) => isWithinWindow(value, previous))
  })
  const visibleRows = sortRowsByOperationalPriority(visibleRecords.map(buildLeadRow))
  const qaCurrent = weightedDailyAverage(
    dailyFacts,
    window,
    'avg_review_score',
    'replies_reviewed',
  )
  const qaPrevious = weightedDailyAverage(
    dailyFacts,
    previous,
    'avg_review_score',
    'replies_reviewed',
  )
  const reviewedRepliesCurrent = sumDailyField(dailyFacts, window, 'replies_reviewed')
  const reviewedRepliesPrevious = sumDailyField(dailyFacts, previous, 'replies_reviewed')
  const approvedRepliesCurrent = sumDailyField(dailyFacts, window, 'replies_good')
  const approvedRepliesPrevious = sumDailyField(dailyFacts, previous, 'replies_good')
  const guardrailTouchesCurrent = sumDailyField(dailyFacts, window, 'guardrail_interventions')
  const guardrailTouchesPrevious = sumDailyField(dailyFacts, previous, 'guardrail_interventions')
  const qaCoverageCurrent = visibleRecords.length
    ? (visibleRecords.filter((record) => record.qaEvents.length > 0).length / visibleRecords.length) * 100
    : 0
  const qaCoveragePrevious = previousVisibleRecords.length
    ? (previousVisibleRecords.filter((record) => record.qaEvents.length > 0).length / previousVisibleRecords.length) * 100
    : 0
  const approvalRateCurrent = reviewedRepliesCurrent
    ? (approvedRepliesCurrent / reviewedRepliesCurrent) * 100
    : 0
  const approvalRatePrevious = reviewedRepliesPrevious
    ? (approvedRepliesPrevious / reviewedRepliesPrevious) * 100
    : 0
  const guardrailTouchRateCurrent = reviewedRepliesCurrent
    ? (guardrailTouchesCurrent / reviewedRepliesCurrent) * 100
    : 0
  const guardrailTouchRatePrevious = reviewedRepliesPrevious
    ? (guardrailTouchesPrevious / reviewedRepliesPrevious) * 100
    : 0

  return {
    summaryCards: [
      buildMetric({
        key: 'avg-reply-quality',
        label: 'Avg Reply Quality',
        numericValue: qaCurrent,
        previousValue: qaPrevious,
        detail: 'Weighted QA score across reviewed replies',
        routePath: '/performance',
        suffix: '%',
        decimals: 0,
      }),
      buildMetric({
        key: 'qa-coverage',
        label: 'QA Coverage',
        numericValue: qaCoverageCurrent,
        previousValue: qaCoveragePrevious,
        detail: 'Visible leads touched by review',
        routePath: '/performance',
        suffix: '%',
        decimals: 0,
      }),
      buildMetric({
        key: 'approval-rate',
        label: 'Approval Rate',
        numericValue: approvalRateCurrent,
        previousValue: approvalRatePrevious,
        detail: 'Reviewed replies marked good',
        routePath: '/performance',
        suffix: '%',
        decimals: 0,
      }),
      buildMetric({
        key: 'guardrail-touch-rate',
        label: 'Guardrail Touch Rate',
        numericValue: guardrailTouchRateCurrent,
        previousValue: guardrailTouchRatePrevious,
        detail: 'Reviewed replies that triggered intervention',
        routePath: '/performance',
        suffix: '%',
        decimals: 0,
        invertTone: true,
      }),
    ],
    reviewScoreTrend: createWeightedTrendSeries(
      dailyFacts,
      window,
      'avg_review_score',
      'replies_reviewed',
    ),
    verdictDistribution: buildVerdictDistribution(dailyFacts, window),
    qualityByStage: buildQualityByStage(visibleRows),
    reviewPressureSeries: buildPerformanceReviewSeries(dailyFacts, window),
    coachingQueue: buildCoachingQueue(visibleRecords),
    topCorrectionThemes: buildCorrectionThemes(dailyFacts, window),
    strongestSegment: buildStrongestPerformingSegment(visibleRows),
    rangeLabel: window.label,
    rangeKey: window.key,
  }
}

export function getSettingsModel(appState, clientId, availableMetrics = []) {
  const activeClient =
    appState?.clients?.find((client) => client.id === clientId) ??
    appState?.clients?.[0] ??
    {}
  const metricSlots = normalizeOverviewMetricSlots(appState?.overviewMetricSlots)
  const widgetSlots = normalizeOverviewWidgetSlots(appState?.overviewWidgetSlots)
  const metricOptions = (availableMetrics.length
    ? availableMetrics
    : DEFAULT_OVERVIEW_METRIC_SLOTS.map((key) => ({
      key,
      label: humanizeValue(key),
    })))
    .map((metric) => ({
      value: metric.key,
      label: metric.label,
    }))
  const landingOptions = navigationItems
    .filter((item) => item.path !== '/settings')
    .map((item) => ({
      value: item.path,
      label: item.label,
    }))

  return {
    workspaceIdentity: {
      initials: activeClient.shortName ?? 'IN',
      workspaceName: activeClient.companyName ?? brandConfig.name,
      brandName: brandConfig.name,
      subtitle: brandConfig.subtitle,
      supportEmail: brandConfig.supportEmail,
      timezone: activeClient.timezone ?? 'America/Los_Angeles',
    },
    dashboardDefaults: {
      landingPath: appState?.defaultLandingPath ?? '/overview',
      rangePreset: appState?.defaultRangePreset ?? DEFAULT_RANGE_PRESET,
      landingOptions,
      rangeOptions: overviewRangeOptions.map((preset) => ({
        value: preset,
        label: RANGE_PRESET_LABELS[preset] ?? preset,
      })),
    },
    overviewDefaults: {
      metricSlots,
      widgetSlots,
      metricOptions,
      widgetOptions: widgetSlots.map((_, index) => getWidgetOptionState(widgetSlots, index)),
    },
    displayPreferences: {
      useCompactNumbers: appState?.overviewUseCompactNumbers ?? true,
      numberFormat: appState?.numberFormat ?? 'compact',
    },
    sessionAccount: {
      email: demoCredentials.email,
      brandLabel: brandConfig.name,
    },
  }
}
