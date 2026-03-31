export const DEFAULT_OVERVIEW_METRIC_SLOTS = [
  'totalLeads',
  'activeConversations',
  'qualifiedLeads',
  'unqualifiedLeads',
  'bookingIntent',
  'confirmedCalls',
  'conversionRate',
  'avgReplyQuality',
]

export const OVERVIEW_WIDGET_CATALOG = [
  {
    key: 'funnel',
    label: 'Lead journey funnel',
    size: 'overview-widget--hero',
    baseSpan: 8,
  },
  {
    key: 'qualificationBreakdown',
    label: 'Qualification breakdown',
    size: 'overview-widget--compact',
    baseSpan: 4,
  },
  {
    key: 'leadTrend',
    label: 'Lead volume trend',
    size: 'overview-widget--wide',
    baseSpan: 6,
  },
  {
    key: 'bookingTrend',
    label: 'Booking trend',
    size: 'overview-widget--wide',
    baseSpan: 6,
  },
  {
    key: 'objectionDistribution',
    label: 'Objection distribution',
    size: 'overview-widget--column',
    baseSpan: 4,
  },
  {
    key: 'needsAttention',
    label: 'Needs attention',
    size: 'overview-widget--column',
    baseSpan: 4,
  },
  {
    key: 'upcomingCalls',
    label: 'Upcoming calls',
    size: 'overview-widget--column',
    baseSpan: 4,
  },
  {
    key: 'topIssues',
    label: 'Top issues',
    size: 'overview-widget--column',
    baseSpan: 4,
  },
]

export const DEFAULT_OVERVIEW_WIDGET_SLOTS = OVERVIEW_WIDGET_CATALOG.map(
  (widget) => widget.key,
)

const VALID_WIDGET_KEYS = new Set(
  OVERVIEW_WIDGET_CATALOG.map((widget) => widget.key),
)

export function getOverviewWidgetConfig(widgetKey) {
  return (
    OVERVIEW_WIDGET_CATALOG.find((widget) => widget.key === widgetKey) ??
    OVERVIEW_WIDGET_CATALOG[0]
  )
}

export function normalizeOverviewMetricSlots(rawSlots) {
  return DEFAULT_OVERVIEW_METRIC_SLOTS.map((defaultKey, index) => {
    const nextKey = rawSlots?.[index]
    return typeof nextKey === 'string' && nextKey.length ? nextKey : defaultKey
  })
}

export function normalizeOverviewWidgetSlots(rawSlots) {
  const incomingSlots = Array.isArray(rawSlots) ? rawSlots : []
  const normalizedSlots = []
  const usedKeys = new Set()

  for (let index = 0; index < DEFAULT_OVERVIEW_WIDGET_SLOTS.length; index += 1) {
    const requestedKey = incomingSlots[index]

    if (VALID_WIDGET_KEYS.has(requestedKey) && !usedKeys.has(requestedKey)) {
      normalizedSlots.push(requestedKey)
      usedKeys.add(requestedKey)
      continue
    }

    const fallbackKey = DEFAULT_OVERVIEW_WIDGET_SLOTS.find(
      (widgetKey) => !usedKeys.has(widgetKey),
    )

    normalizedSlots.push(fallbackKey ?? DEFAULT_OVERVIEW_WIDGET_SLOTS[0])
    usedKeys.add(normalizedSlots.at(-1))
  }

  return normalizedSlots
}

export function getWidgetOptionState(currentSlots, currentIndex) {
  const selectedKeys = new Set(
    currentSlots.filter((widgetKey, slotIndex) => slotIndex !== currentIndex),
  )

  return OVERVIEW_WIDGET_CATALOG.map((widget) => ({
    label: widget.label,
    value: widget.key,
    disabled: selectedKeys.has(widget.key),
  }))
}

function flushLayoutRow(rowItems) {
  if (!rowItems.length) {
    return []
  }

  const totalSpan = rowItems.reduce((sum, item) => sum + item.baseSpan, 0)
  const remaining = Math.max(0, 12 - totalSpan)
  const spans = rowItems.map((item) => item.baseSpan)

  if (remaining > 0) {
    spans[spans.length - 1] = Math.min(12, spans.at(-1) + remaining)
  }

  return rowItems.map((item, index) => ({
    key: item.key,
    label: item.label,
    span: spans[index],
  }))
}

export function buildOverviewWidgetLayout(rawSlots) {
  const slots = normalizeOverviewWidgetSlots(rawSlots)
  const layout = []
  let rowItems = []
  let rowSpan = 0

  slots.forEach((widgetKey) => {
    const config = getOverviewWidgetConfig(widgetKey)
    const baseSpan = config.baseSpan ?? 6

    if (baseSpan >= 12) {
      layout.push(...flushLayoutRow(rowItems))
      rowItems = []
      rowSpan = 0
      layout.push({
        key: config.key,
        label: config.label,
        span: 12,
      })
      return
    }

    if (rowSpan + baseSpan > 12) {
      layout.push(...flushLayoutRow(rowItems))
      rowItems = []
      rowSpan = 0
    }

    rowItems.push({
      key: config.key,
      label: config.label,
      baseSpan,
    })
    rowSpan += baseSpan

    if (rowSpan === 12) {
      layout.push(...flushLayoutRow(rowItems))
      rowItems = []
      rowSpan = 0
    }
  })

  layout.push(...flushLayoutRow(rowItems))
  return layout
}
