import { useEffect, useMemo, useState } from 'react'

function formatValue(value, {
  prefix = '',
  suffix = '',
  decimals = 0,
  compact = false,
} = {}) {
  const formatter = new Intl.NumberFormat('en-US', compact ? {
    notation: 'compact',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  } : {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  })

  return `${prefix}${formatter.format(value)}${suffix}`
}

export default function AnimatedNumber({
  value,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
  compact = false,
  duration = 1100,
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let animationFrame = 0
    const startedAt = performance.now()

    const step = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - ((1 - progress) ** 3)
      setDisplayValue(value * eased)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      }
    }

    animationFrame = requestAnimationFrame(step)

    return () => cancelAnimationFrame(animationFrame)
  }, [duration, value])

  const text = useMemo(
    () =>
      formatValue(displayValue, {
        prefix,
        suffix,
        decimals,
        compact,
      }),
    [compact, decimals, displayValue, prefix, suffix],
  )

  return <span className={className}>{text}</span>
}
