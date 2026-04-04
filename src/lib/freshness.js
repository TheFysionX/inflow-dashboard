function coerceDate(value) {
  if (!value) {
    return null
  }

  const nextDate = value instanceof Date ? value : new Date(value)

  return Number.isNaN(nextDate.getTime()) ? null : nextDate
}

export function getFreshnessMeta(referenceNow, timezone = 'America/Los_Angeles') {
  const date = coerceDate(referenceNow)

  if (!date) {
    return {
      shortLabel: 'Freshness unavailable',
      label: 'Data freshness unavailable',
      timestamp: '',
    }
  }

  const shortFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  })
  const longFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
    timeZoneName: 'short',
  })

  return {
    shortLabel: `Updated ${shortFormatter.format(date)}`,
    label: `Updated ${longFormatter.format(date)}`,
    timestamp: date.toISOString(),
  }
}
