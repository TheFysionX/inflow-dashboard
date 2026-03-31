import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

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
  }

  const presetStops = {
    'var(--accent-blue)': () => [
      { offset: '0%', color: lightPalette.blue, opacity: 0.98 },
      {
        offset: `${accentWindows.early.toFixed(1)}%`,
        color: lightPalette.violet,
        opacity: 0.9 + (random() * 0.08),
      },
      { offset: `${accentWindows.midA.toFixed(1)}%`, color: lightPalette.blue, opacity: 1 },
      {
        offset: `${accentWindows.midB.toFixed(1)}%`,
        color: lightPalette.pink,
        opacity: 0.88 + (random() * 0.08),
      },
      { offset: `${accentWindows.late.toFixed(1)}%`, color: lightPalette.blue, opacity: 1 },
      { offset: '100%', color: lightPalette.blue, opacity: 0.98 },
    ],
    'var(--accent-pink)': () => [
      { offset: '0%', color: lightPalette.pink, opacity: 0.98 },
      {
        offset: `${accentWindows.early.toFixed(1)}%`,
        color: lightPalette.violet,
        opacity: 0.88 + (random() * 0.08),
      },
      { offset: `${accentWindows.midA.toFixed(1)}%`, color: lightPalette.pink, opacity: 1 },
      {
        offset: `${accentWindows.midB.toFixed(1)}%`,
        color: lightPalette.blue,
        opacity: 0.9 + (random() * 0.07),
      },
      { offset: `${accentWindows.late.toFixed(1)}%`, color: lightPalette.pink, opacity: 1 },
      { offset: '100%', color: lightPalette.pink, opacity: 0.98 },
    ],
    'var(--accent-violet)': () => [
      { offset: '0%', color: lightPalette.violet, opacity: 0.98 },
      {
        offset: `${accentWindows.early.toFixed(1)}%`,
        color: lightPalette.blue,
        opacity: 0.88 + (random() * 0.08),
      },
      { offset: `${accentWindows.midA.toFixed(1)}%`, color: lightPalette.violet, opacity: 1 },
      {
        offset: `${accentWindows.midB.toFixed(1)}%`,
        color: lightPalette.pink,
        opacity: 0.88 + (random() * 0.08),
      },
      { offset: `${accentWindows.late.toFixed(1)}%`, color: lightPalette.violet, opacity: 1 },
      { offset: '100%', color: lightPalette.violet, opacity: 0.98 },
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

export default function TraceLineChart({
  data,
  color,
  height = 260,
  formatValue,
  lineKey = 'default',
}) {
  const [activeIndex, setActiveIndex] = useState(null)
  const width = 560
  const chartHeight = height
  const padding = { top: 18, right: 34, bottom: 34, left: 42 }
  const max = Math.max(...data.map((item) => item.value), 1)
  const min = Math.min(...data.map((item) => item.value), 0)
  const yMin = min > 0 ? 0 : min
  const yRange = Math.max(max - yMin, 1)
  const axisValues = Array.from({ length: 4 }).map((_, index) => {
    const ratio = 1 - (index / 3)
    return Math.round(yMin + (yRange * ratio))
  })

  useEffect(() => {
    setActiveIndex(null)
  }, [lineKey])

  const points = useMemo(
    () =>
      data.map((item, index) => {
        const x =
          padding.left +
          (index * (width - padding.left - padding.right)) / Math.max(data.length - 1, 1)
        const y =
          padding.top +
          ((max - item.value) * (chartHeight - padding.top - padding.bottom)) / yRange

        return { ...item, x, y }
      }),
    [chartHeight, data, max, padding.bottom, padding.left, padding.right, padding.top, width, yRange],
  )
  const labelEvery = Math.max(1, Math.ceil(points.length / 6))

  const path = buildSmoothPath(points)
  const displayedPoint =
    activeIndex === null ? points.at(-1) : points[activeIndex]
  const endPoint = points.at(-1)
  const gradientId = useMemo(
    () => `trace-gradient-${String(lineKey).replace(/[^a-zA-Z0-9_-]/g, '-')}`,
    [lineKey],
  )
  const gradientStops = useMemo(() => getGradientStops(color, lineKey), [color, lineKey])

  return (
    <div className="trace-chart-shell">
      <div className="trace-chart-meta">
        <strong>{displayedPoint?.label}</strong>
        <span>{formatValue(displayedPoint?.value ?? 0)}</span>
      </div>

      <svg
        className="trace-chart"
        preserveAspectRatio="none"
        viewBox={`0 0 ${width} ${chartHeight}`}
      >
        <defs>
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
                x={padding.left - 10}
                y={y + 4}
              >
                {formatAxisValue(axisValue)}
              </text>
            </g>
          )
        })}

        <motion.path
          animate={{ pathLength: 1, opacity: 1 }}
          className="trace-chart-line"
          d={path}
          fill="none"
          initial={{ pathLength: 0, opacity: 0.72 }}
          key={`path-${lineKey}`}
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeWidth="4"
          transition={{ duration: 2.55, ease: [0.18, 0.82, 0.3, 1] }}
        />

        {points.map((point, index) => {
          const nextPoint = points[index + 1]
          const segmentWidth = nextPoint ? nextPoint.x - point.x : 28

          return (
            <rect
              className="trace-chart-hit-area"
              height={chartHeight - padding.top - padding.bottom}
              key={`${point.label}-${point.value}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              width={Math.max(segmentWidth, 28)}
              x={point.x - 14}
              y={padding.top}
            />
          )
        })}

        {activeIndex !== null && displayedPoint ? (
          <circle
            className="trace-chart-hover-indicator"
            cx={displayedPoint.x}
            cy={displayedPoint.y}
            fill={color}
            r="4.2"
          />
        ) : null}

        {endPoint ? (
          <motion.g
            animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1, 1.9, 2.4] }}
            initial={{ opacity: 0, scale: 0.4 }}
            key={`pulse-${lineKey}`}
            transition={{ duration: 1.05, delay: 2.08, ease: 'easeOut' }}
          >
            <circle
              cx={endPoint.x}
              cy={endPoint.y}
              fill={color}
              fillOpacity="0.08"
              r="12"
              stroke={color}
              strokeOpacity="0.46"
            />
          </motion.g>
        ) : null}

        {points.map((point, index) =>
          index % labelEvery === 0 || index === points.length - 1 ? (
            <text
              className="trace-chart-label"
              key={point.label}
              textAnchor="middle"
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
