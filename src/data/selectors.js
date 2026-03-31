import {
  DEMO_DATA_START,
  REFERENCE_NOW,
  STAGE_LABELS,
  STAGE_ORDER,
} from './demoData'
import { OVERVIEW_DATA_CUTOFF, getOverviewLeadOverride } from './overviewSupplement'
import {
  DEFAULT_RANGE_PRESET,
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

      if (recencyDays > 21) {
        return null
      }

      const note = record.overviewOverride.attentionNote
        || (replyGapHours >= 72
          ? `No reply for ${Math.max(1, Math.round(replyGapHours / 24))} days`
          : stageAgeDays >= 4
            ? `${STAGE_LABELS[record.thread.currentStage]} stage needs a nudge`
            : 'Momentum is slowing down')

      return {
        leadName: record.lead.displayName,
        stage: STAGE_LABELS[record.thread.currentStage],
        stageAge: formatStageAge(record.thread.enteredStageAt),
        note,
        status: stageAgeDays >= 5 || replyGapHours >= 72 ? 'warning' : 'info',
        urgencyScore: (stageAgeDays * 3) + Math.round(replyGapHours / 12),
      }
    })
    .filter(Boolean)
    .sort((left, right) => right.urgencyScore - left.urgencyScore)
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
    .map((record) => ({
      leadName: record.lead.displayName,
      time: formatDateTime(record.callTime),
      relativeTime: formatRelativeTime(record.callTime),
      timezone: record.bookingEvent.timezone,
    }))
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
      stage: STAGE_LABELS.objection,
      value: sumDailyField(dailyFacts, window, 'objection_entries'),
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

  return rawStages.reduce((items, item, index) => {
    const previousValue = items[index - 1]?.value ?? item.value

    items.push({
      ...item,
      value: index === 0 ? item.value : Math.min(item.value, previousValue),
    })

    return items
  }, [])
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
  const conversionRateCurrent = totalLeadsCurrent
    ? (closedWonCurrent / totalLeadsCurrent) * 100
    : 0
  const conversionRatePrevious = totalLeadsPrevious
    ? (closedWonPrevious / totalLeadsPrevious) * 100
    : 0

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
    bookingTrend,
    qualificationSeries,
    objectionSeries,
    needsAttention,
    upcomingCalls,
    topIssues: getTopIssues(cohortRecords, objectionSeries, funnelSeries),
    rangeKey: window.key,
    rangeLabel: window.label,
  }
}
