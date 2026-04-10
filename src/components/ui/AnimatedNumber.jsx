import { animate } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'

function buildFormatter(decimals, compact) {
  return new Intl.NumberFormat(
    'en-US',
    compact
      ? {
          notation: 'compact',
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals,
        }
      : {
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals,
        },
  )
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
  const textRef = useRef(null)
  const formatter = useMemo(
    () => buildFormatter(decimals, compact),
    [compact, decimals],
  )
  const formatValue = useMemo(
    () => (nextValue) => `${prefix}${formatter.format(nextValue)}${suffix}`,
    [formatter, prefix, suffix],
  )
  const initialText = useMemo(() => formatValue(0), [formatValue])

  useEffect(() => {
    if (textRef.current) {
      textRef.current.textContent = initialText
    }
  }, [initialText])

  useEffect(() => {
    const element = textRef.current

    if (!element) {
      return undefined
    }

    const controls = animate(0, value, {
      duration: duration / 1000,
      ease: (progress) => 1 - ((1 - progress) ** 3),
      onUpdate: (latestValue) => {
        element.textContent = formatValue(latestValue)
      },
    })

    return () => controls.stop()
  }, [duration, formatValue, value])

  return (
    <span className={className} ref={textRef}>
      {initialText}
    </span>
  )
}
