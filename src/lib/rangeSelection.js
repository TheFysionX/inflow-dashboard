import { format } from 'date-fns'

export const DEFAULT_RANGE_PRESET = '30D'

export const RANGE_PRESET_LABELS = {
  '7D': '7 days',
  '30D': '30 days',
  '3M': '3 months',
  '6M': '6 months',
  YTD: 'Year to date',
  '12M': '12 months',
  'All Time': 'All time',
}

function serializeCalendarDate(date) {
  return format(date, 'yyyy-MM-dd')
}

function parseCalendarDate(dateValue) {
  return new Date(`${dateValue}T00:00:00`)
}

function formatRangeLabel(startDate, endDate) {
  return `${format(parseCalendarDate(startDate), 'MMM d')} - ${format(
    parseCalendarDate(endDate),
    'MMM d, yyyy',
  )}`
}

export function buildPresetRangeSelection(preset = DEFAULT_RANGE_PRESET) {
  return {
    mode: 'preset',
    preset,
    startDate: '',
    endDate: '',
    label: RANGE_PRESET_LABELS[preset] ?? preset,
  }
}

export function buildCustomRangeSelection(from, to) {
  if (!from || !to) {
    return buildPresetRangeSelection()
  }

  const start = from <= to ? from : to
  const end = from <= to ? to : from
  const startDate = serializeCalendarDate(start)
  const endDate = serializeCalendarDate(end)

  return {
    mode: 'custom',
    preset: 'custom',
    startDate,
    endDate,
    label: formatRangeLabel(startDate, endDate),
  }
}

export function normalizeRangeSelection(rawSelection) {
  if (typeof rawSelection === 'string') {
    return buildPresetRangeSelection(rawSelection)
  }

  if (rawSelection?.mode === 'custom' && rawSelection.startDate && rawSelection.endDate) {
    return {
      mode: 'custom',
      preset: 'custom',
      startDate: rawSelection.startDate,
      endDate: rawSelection.endDate,
      label:
        rawSelection.label ??
        formatRangeLabel(rawSelection.startDate, rawSelection.endDate),
    }
  }

  if (rawSelection?.preset) {
    return buildPresetRangeSelection(rawSelection.preset)
  }

  return buildPresetRangeSelection()
}

export function getRangeSelectionKey(rangeSelection) {
  const normalized = normalizeRangeSelection(rangeSelection)

  if (normalized.mode === 'custom') {
    return `custom:${normalized.startDate}:${normalized.endDate}`
  }

  return `preset:${normalized.preset}`
}

export function getRangeSelectionBounds(rangeSelection) {
  const normalized = normalizeRangeSelection(rangeSelection)

  if (normalized.mode !== 'custom') {
    return null
  }

  return {
    start: new Date(`${normalized.startDate}T00:00:00`),
    end: new Date(`${normalized.endDate}T23:59:59.999`),
  }
}
