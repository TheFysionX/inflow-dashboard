import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRightIcon } from './Icons'

function buildSmoothPath(points) {
  if (!points.length) {
    return ''
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`
  }

  let path = `M ${points[0].x} ${points[0].y}`

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    const controlX = (current.x + next.x) / 2

    path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`
  }

  return path
}

function formatAxisValue(value) {
  return new Intl.NumberFormat('en-US', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function getNiceStep(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return 1
  }

  const exponent = 10 ** Math.floor(Math.log10(value))
  const fraction = value / exponent
  const candidates = [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10]
  const selected = candidates.find((candidate) => fraction <= candidate) ?? 10

  return selected * exponent
}

function buildAxisScale(values, tickCount) {
  const numericValues = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))

  if (!numericValues.length) {
    return {
      axisValues: Array.from({ length: tickCount }).map((_, index) => tickCount - index - 1),
      min: 0,
      max: Math.max(tickCount - 1, 1),
      range: Math.max(tickCount - 1, 1),
    }
  }

  const rawMin = Math.min(...numericValues)
  const rawMax = Math.max(...numericValues)
  const rawRange = Math.max(rawMax - rawMin, Math.abs(rawMax || rawMin || 1) * 0.18, 1)
  const bottomBuffer = rawRange * 0.32
  const topBuffer = rawRange * 0.08

  let targetMin = rawMin - bottomBuffer
  const targetMax = rawMax + topBuffer

  if (rawMin >= 0 && rawMin <= rawRange * 0.18) {
    targetMin = 0
  }

  if (rawMin >= 0) {
    targetMin = Math.max(0, targetMin)
  }

  const intervalCount = Math.max(tickCount - 1, 1)
  let step = getNiceStep((targetMax - targetMin) / intervalCount)
  let minIndex = Math.floor(targetMin / step)
  let maxStartIndex = Math.ceil(targetMax / step) - intervalCount

  while (maxStartIndex > minIndex) {
    step = getNiceStep(step * 1.18)
    minIndex = Math.floor(targetMin / step)
    maxStartIndex = Math.ceil(targetMax / step) - intervalCount
  }

  const startIndex = maxStartIndex
  const min = startIndex * step
  const max = min + (step * intervalCount)
  const axisValues = Array.from({ length: tickCount }).map((_, index) => max - (step * index))

  return {
    axisValues,
    min,
    max,
    range: Math.max(max - min, 1),
  }
}

function buildPlotGeometry(pointCount, padding, width) {
  const innerWidth = width - padding.left - padding.right

  if (pointCount <= 1) {
    return {
      getBounds: () => ({ x: padding.left, width: innerWidth }),
      getX: () => padding.left + (innerWidth / 2),
      step: innerWidth,
    }
  }

  const step = innerWidth / Math.max(pointCount - 1, 1)

  return {
    getBounds: (index) => {
      const currentX = padding.left + (step * index)

      if (index === 0) {
        return {
          x: currentX,
          width: step / 2,
        }
      }

      if (index === pointCount - 1) {
        return {
          x: currentX - (step / 2),
          width: step / 2,
        }
      }

      return {
        x: currentX - (step / 2),
        width: step,
      }
    },
    getX: (index) => padding.left + (step * index),
    step,
  }
}

function hexToRgb(color) {
  const normalized = color.replace('#', '')

  if (!/^[\da-f]{6}$/i.test(normalized)) {
    return null
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`
}

function shiftShade(color, amount) {
  const rgb = hexToRgb(color)

  if (!rgb) {
    return color
  }

  return rgbToHex({
    r: rgb.r + amount,
    g: rgb.g + amount,
    b: rgb.b + amount,
  })
}

function createSeed(input) {
  return Array.from(String(input)).reduce(
    (seed, character) => ((seed * 31) + character.charCodeAt(0)) % 2147483647,
    17,
  )
}

function createSeededRandom(seedValue) {
  let seed = seedValue || 1

  return () => {
    seed = (seed * 48271) % 2147483647
    return seed / 2147483647
  }
}

function getGradientStops(color, lineKey) {
  const random = createSeededRandom(createSeed(lineKey))
  const accentWindows = {
    early: 10 + (random() * 18),
    midA: 26 + (random() * 18),
    midB: 54 + (random() * 16),
    late: 74 + (random() * 14),
  }
  const lightPalette = {
    blue: '#8bd7ff',
    pink: '#ffc2ef',
    violet: '#b6a1ff',
    green: '#8be7c2',
  }

  const presetStops = {
    'var(--accent-blue)': () => [
      { offset: '0%', color: lightPalette.blue, opacity: 0.98 },
      { offset: `${accentWindows.early.toFixed(1)}%`, color: lightPalette.violet, opacity: 0.95 },
      { offset: `${accentWindows.midA.toFixed(1)}%`, color: lightPalette.blue, opacity: 1 },
      { offset: `${accentWindows.midB.toFixed(1)}%`, color: lightPalette.pink, opacity: 0.94 },
      { offset: `${accentWindows.late.toFixed(1)}%`, color: lightPalette.blue, opacity: 1 },
      { offset: '100%', color: lightPalette.blue, opacity: 0.98 },
    ],
    'var(--accent-pink)': () => [
      { offset: '0%', color: lightPalette.pink, opacity: 0.98 },
      { offset: `${accentWindows.early.toFixed(1)}%`, color: lightPalette.violet, opacity: 0.94 },
      { offset: `${accentWindows.midA.toFixed(1)}%`, color: lightPalette.pink, opacity: 1 },
      { offset: `${accentWindows.midB.toFixed(1)}%`, color: lightPalette.blue, opacity: 0.93 },
      { offset: `${accentWindows.late.toFixed(1)}%`, color: lightPalette.pink, opacity: 1 },
      { offset: '100%', color: lightPalette.pink, opacity: 0.98 },
    ],
    'var(--accent-violet)': () => [
      { offset: '0%', color: lightPalette.violet, opacity: 0.98 },
      { offset: `${accentWindows.early.toFixed(1)}%`, color: lightPalette.blue, opacity: 0.94 },
      { offset: `${accentWindows.midA.toFixed(1)}%`, color: lightPalette.violet, opacity: 1 },
      { offset: `${accentWindows.midB.toFixed(1)}%`, color: lightPalette.pink, opacity: 0.94 },
      { offset: `${accentWindows.late.toFixed(1)}%`, color: lightPalette.violet, opacity: 1 },
      { offset: '100%', color: lightPalette.violet, opacity: 0.98 },
    ],
    '#8be7c2': () => [
      { offset: '0%', color: lightPalette.green, opacity: 0.98 },
      { offset: `${accentWindows.early.toFixed(1)}%`, color: lightPalette.blue, opacity: 0.93 },
      { offset: `${accentWindows.midA.toFixed(1)}%`, color: lightPalette.green, opacity: 1 },
      { offset: `${accentWindows.midB.toFixed(1)}%`, color: lightPalette.pink, opacity: 0.93 },
      { offset: `${accentWindows.late.toFixed(1)}%`, color: lightPalette.green, opacity: 1 },
      { offset: '100%', color: lightPalette.green, opacity: 0.98 },
    ],
    'var(--color-success)': () => [
      { offset: '0%', color: lightPalette.green, opacity: 0.98 },
      { offset: `${accentWindows.early.toFixed(1)}%`, color: lightPalette.blue, opacity: 0.93 },
      { offset: `${accentWindows.midA.toFixed(1)}%`, color: lightPalette.green, opacity: 1 },
      { offset: `${accentWindows.midB.toFixed(1)}%`, color: lightPalette.pink, opacity: 0.93 },
      { offset: `${accentWindows.late.toFixed(1)}%`, color: lightPalette.green, opacity: 1 },
      { offset: '100%', color: lightPalette.green, opacity: 0.98 },
    ],
  }

  if (presetStops[color]) {
    return presetStops[color]()
  }

  if (typeof color === 'string' && color.startsWith('#')) {
    return [
      { offset: '0%', color: shiftShade(color, 14), opacity: 0.96 },
      { offset: '50%', color, opacity: 1 },
      { offset: '100%', color: shiftShade(color, 28), opacity: 0.98 },
    ]
  }

  return [
    { offset: '0%', color, opacity: 0.94 },
    { offset: '50%', color, opacity: 1 },
    { offset: '100%', color, opacity: 0.96 },
  ]
}

function getHoverDotStops(color) {
  const palette = {
    blue: '#8bd7ff',
    pink: '#ffc2ef',
    violet: '#b6a1ff',
    green: '#8be7c2',
  }

  const presetStops = {
    'var(--accent-blue)': [
      { offset: '0%', color: palette.violet, opacity: 1 },
      { offset: '58%', color: palette.pink, opacity: 0.98 },
      { offset: '100%', color: palette.blue, opacity: 0.78 },
    ],
    'var(--accent-pink)': [
      { offset: '0%', color: palette.blue, opacity: 0.98 },
      { offset: '58%', color: palette.violet, opacity: 1 },
      { offset: '100%', color: palette.pink, opacity: 0.76 },
    ],
    'var(--accent-violet)': [
      { offset: '0%', color: palette.blue, opacity: 1 },
      { offset: '58%', color: palette.pink, opacity: 0.98 },
      { offset: '100%', color: palette.violet, opacity: 0.78 },
    ],
    '#8be7c2': [
      { offset: '0%', color: palette.blue, opacity: 0.98 },
      { offset: '58%', color: palette.pink, opacity: 0.98 },
      { offset: '100%', color: palette.green, opacity: 0.8 },
    ],
    'var(--color-success)': [
      { offset: '0%', color: palette.blue, opacity: 0.98 },
      { offset: '58%', color: palette.pink, opacity: 0.98 },
      { offset: '100%', color: palette.green, opacity: 0.8 },
    ],
  }

  return presetStops[color] ?? [
    { offset: '0%', color, opacity: 1 },
    { offset: '100%', color, opacity: 0.82 },
  ]
}

export default function DualTraceLineChart({
  data,
  series,
  height = 280,
  lineKey = 'dual-trace',
  yTickCount = 6,
  labelTargetCount = 6,
  axisFontSize = 10,
  labelFontSize = 10,
  viewWidth = 560,
}) {
  const [activeIndex, setActiveIndex] = useState(null)
  const [dragStartIndex, setDragStartIndex] = useState(null)
  const [dragCurrentIndex, setDragCurrentIndex] = useState(null)
  const width = viewWidth
  const chartHeight = height
  const padding = { top: 18, right: 34, bottom: 34, left: 42 }
  const axisScale = useMemo(
    () => buildAxisScale(
      data.flatMap((item) => series.map((entry) => Number(item[entry.key] ?? 0))),
      yTickCount,
    ),
    [data, series, yTickCount],
  )
  const { axisValues, max, min, range: yRange } = axisScale

  const plotGeometry = useMemo(
    () => buildPlotGeometry(data.length, padding, width),
    [data.length, padding.left, padding.right, width],
  )

  useEffect(() => {
    setActiveIndex(null)
    setDragStartIndex(null)
    setDragCurrentIndex(null)
  }, [lineKey])

  useEffect(() => {
    function handleMouseUp() {
      if (dragStartIndex === null) {
        return
      }

      setDragStartIndex(null)
      setDragCurrentIndex(null)
    }

    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [dragCurrentIndex, dragStartIndex])

  const pointMap = useMemo(
    () =>
      series.map((entry) => ({
        ...entry,
        points: data.map((item, index) => {
          const x = plotGeometry.getX(index)
          const y =
            padding.top +
            ((max - Number(item[entry.key] ?? 0)) * (chartHeight - padding.top - padding.bottom)) / yRange

          return {
            x,
            y,
            label: item.label,
            value: Number(item[entry.key] ?? 0),
          }
        }),
      })),
    [
      chartHeight,
      data,
      max,
      padding.bottom,
      padding.top,
      plotGeometry,
      series,
      yRange,
    ],
  )

  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(labelTargetCount, 1)))
  const displayedLabel = activeIndex === null ? data.at(-1)?.label : data[activeIndex]?.label
  const activePoints = activeIndex === null
    ? pointMap.map((entry) => entry.points.at(-1))
    : pointMap.map((entry) => entry.points[activeIndex])
  const effectiveSelection = dragStartIndex === null
    ? null
    : {
      start: Math.min(dragStartIndex, dragCurrentIndex ?? dragStartIndex),
      end: Math.max(dragStartIndex, dragCurrentIndex ?? dragStartIndex),
    }
  const compareStartIndex = dragStartIndex
  const compareEndIndex = dragCurrentIndex ?? dragStartIndex

  const selectionSummary = useMemo(() => {
    if (compareStartIndex === null || compareEndIndex === null) {
      return null
    }

    return {
      startLabel: data[compareStartIndex]?.label,
      endLabel: data[compareEndIndex]?.label,
      series: pointMap.map((entry) => {
        const startPoint = entry.points[compareStartIndex]
        const endPoint = entry.points[compareEndIndex]
        const delta = (endPoint?.value ?? 0) - (startPoint?.value ?? 0)
        const percent = startPoint?.value
          ? (delta / startPoint.value) * 100
          : delta === 0
            ? 0
            : 100
        const tone = delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral'

        return {
          key: entry.key,
          label: entry.label,
          color: entry.color,
          delta,
          percent,
          tone,
        }
      }),
    }
  }, [compareEndIndex, compareStartIndex, data, pointMap])

  const selectionBand = effectiveSelection && pointMap[0]?.points.length
    ? (() => {
      const startBounds = plotGeometry.getBounds(effectiveSelection.start)
      const endBounds = plotGeometry.getBounds(effectiveSelection.end)
      const x = startBounds.x
      const rightEdge = endBounds.x + endBounds.width

      return {
        x,
        width: rightEdge - x,
      }
    })()
    : null

  return (
    <div className={`trace-chart-shell ${dragStartIndex !== null ? 'is-dragging' : ''}`}>
      <div className="trace-chart-meta trace-chart-meta--dual">
        <strong>
          {selectionSummary
            ? (
              <span className="trace-chart-range-label">
                <span>{selectionSummary.startLabel}</span>
                <ArrowRightIcon size={13} />
                <span>{selectionSummary.endLabel}</span>
              </span>
            )
            : displayedLabel}
        </strong>
        <div className="trace-chart-meta-series">
          {(selectionSummary
            ? selectionSummary.series
            : pointMap.map((entry) => {
              const activePoint = activeIndex === null
                ? entry.points.at(-1)
                : entry.points[activeIndex]

              return {
                key: entry.key,
                label: entry.label,
                color: entry.color,
                value: activePoint?.value ?? 0,
              }
            })).map((entry) => (
              <span className="trace-chart-series-pill" key={entry.key}>
                <i style={{ '--trace-pill-color': entry.color }} />
                <span>{entry.label}</span>
                {selectionSummary ? (
                  <span className={`trace-chart-delta trace-chart-delta--${entry.tone}`}>
                    {`${entry.delta > 0 ? '+' : ''}${new Intl.NumberFormat('en-US').format(entry.delta)}`}
                    {' '}
                    <small>
                      ({`${entry.percent > 0 ? '+' : ''}${Math.round(entry.percent * 10) / 10}%`})
                    </small>
                  </span>
                ) : (
                  <strong>{new Intl.NumberFormat('en-US').format(entry.value ?? 0)}</strong>
                )}
              </span>
            ))}
        </div>
      </div>

      <svg
        className="trace-chart"
        preserveAspectRatio="none"
        viewBox={`0 0 ${width} ${chartHeight}`}
      >
        <defs>
          {pointMap.map((entry) => {
            const gradientId = `trace-gradient-${String(lineKey).replace(/[^a-zA-Z0-9_-]/g, '-')}-${entry.key}`
            const hoverGradientId = `trace-hover-gradient-${String(lineKey).replace(/[^a-zA-Z0-9_-]/g, '-')}-${entry.key}`
            const gradientStops = getGradientStops(entry.color, `${lineKey}-${entry.key}`)
            const hoverStops = getHoverDotStops(entry.color)

            return (
              <g key={entry.key}>
                <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
                  {gradientStops.map((stop) => (
                    <stop
                      key={`${gradientId}-${stop.offset}`}
                      offset={stop.offset}
                      stopColor={stop.color}
                      stopOpacity={stop.opacity}
                    />
                  ))}
                </linearGradient>
                <radialGradient id={hoverGradientId} cx="35%" cy="35%" r="75%">
                  {hoverStops.map((stop) => (
                    <stop
                      key={`${hoverGradientId}-${stop.offset}`}
                      offset={stop.offset}
                      stopColor={stop.color}
                      stopOpacity={stop.opacity}
                    />
                  ))}
                </radialGradient>
              </g>
            )
          })}
        </defs>

        {axisValues.map((axisValue, index) => {
          const y =
            padding.top +
            (index * (chartHeight - padding.top - padding.bottom)) / Math.max(axisValues.length - 1, 1)

          return (
            <g key={`${axisValue}-${y}`}>
              <line
                className="trace-chart-grid"
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
              <text
                className="trace-chart-axis-label"
                textAnchor="end"
                style={{ fontSize: axisFontSize }}
                x={padding.left - 10}
                y={y + 4}
              >
                {formatAxisValue(axisValue)}
              </text>
            </g>
          )
        })}

        {selectionBand ? (
          <rect
            className="trace-chart-selection-band"
            height={chartHeight - padding.top - padding.bottom}
            pointerEvents="none"
            width={Math.max(selectionBand.width, 18)}
            x={selectionBand.x}
            y={padding.top}
          />
        ) : null}

        {pointMap.map((entry, entryIndex) => {
          const path = buildSmoothPath(entry.points)
          const gradientId = `trace-gradient-${String(lineKey).replace(/[^a-zA-Z0-9_-]/g, '-')}-${entry.key}`

          return (
            <motion.path
              animate={{ pathLength: 1, opacity: 1 }}
              className="trace-chart-line"
              d={path}
              fill="none"
              initial={{ pathLength: 0, opacity: 0.72 }}
              key={`path-${lineKey}-${entry.key}`}
              pointerEvents="none"
              stroke={`url(#${gradientId})`}
              strokeLinecap="round"
              strokeWidth={entryIndex === 0 ? 2.35 : 2.1}
              transition={{
                duration: 2.4,
                delay: entryIndex * 0.08,
                ease: [0.18, 0.82, 0.3, 1],
              }}
            />
          )
        })}

        {data.map((item, index) => {
          const bounds = plotGeometry.getBounds(index)

          return (
            <rect
              className="trace-chart-hit-area"
              height={chartHeight - padding.top - padding.bottom}
              key={`${item.label}-${index}`}
              onMouseDown={() => {
                setDragStartIndex(index)
                setDragCurrentIndex(index)
                setActiveIndex(index)
              }}
              onMouseEnter={() => {
                setActiveIndex(index)
                if (dragStartIndex !== null) {
                  setDragCurrentIndex(index)
                }
              }}
              onMouseLeave={() => {
                if (dragStartIndex === null) {
                  setActiveIndex(null)
                }
              }}
              onMouseMove={() => {
                if (dragStartIndex !== null) {
                  setDragCurrentIndex(index)
                }
              }}
              width={Math.max(bounds.width, 18)}
              x={bounds.x}
              y={padding.top}
            />
          )
        })}

        {activeIndex !== null && activePoints.every(Boolean) ? (
          <polyline
            className="trace-chart-connector"
            fill="none"
            points={activePoints
              .filter(Boolean)
              .sort((left, right) => left.y - right.y)
              .map((point) => `${point.x},${point.y}`)
              .join(' ')}
            pointerEvents="none"
          />
        ) : null}

        {activeIndex !== null
          ? pointMap.map((entry) => {
            const displayedPoint = entry.points[activeIndex]
            const hoverGradientId = `trace-hover-gradient-${String(lineKey).replace(/[^a-zA-Z0-9_-]/g, '-')}-${entry.key}`

            return displayedPoint ? (
              <circle
                className="trace-chart-hover-indicator"
                cx={displayedPoint.x}
                cy={displayedPoint.y}
                fill={`url(#${hoverGradientId})`}
                key={`hover-${entry.key}`}
                pointerEvents="none"
                r="4.2"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1.2"
              />
            ) : null
          })
          : null}

        {pointMap.map((entry) => {
          const endPoint = entry.points.at(-1)

          return endPoint ? (
            <motion.g
              animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1, 1.7, 2.1] }}
              initial={{ opacity: 0, scale: 0.4 }}
              key={`pulse-${lineKey}-${entry.key}`}
              transition={{ duration: 1.02, delay: 1.95, ease: 'easeOut' }}
            >
              <circle
                cx={endPoint.x}
                cy={endPoint.y}
                fill={entry.color}
                fillOpacity="0.08"
                r="11"
                stroke={entry.color}
                strokeOpacity="0.4"
              />
            </motion.g>
          ) : null
        })}

        {pointMap[0]?.points.map((point, index) =>
          index % labelEvery === 0 || index === pointMap[0].points.length - 1 ? (
            <text
              className="trace-chart-label"
              key={point.label}
              textAnchor="middle"
              style={{ fontSize: labelFontSize }}
              x={point.x}
              y={chartHeight - 8}
            >
              {point.label}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  )
}
