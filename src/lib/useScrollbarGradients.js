import { useEffect } from 'react'

const SCROLLBAR_SELECTOR = [
  '.dashboard-content',
  '.sidebar-panel',
  '.option-select-popover',
  '.list-stack--scrollable',
  '.conversation-detail-column',
  '.data-table-scroll',
  '.lead-drawer-body',
].join(', ')

const SCROLLBAR_PALETTES = [
  ['#74c7ff', '#8f6dff', '#f49be3'],
  ['#f49be3', '#74c7ff', '#b6a1ff'],
  ['#8f6dff', '#74c7ff', '#f49be3'],
  ['#74c7ff', '#f49be3', '#8f6dff'],
  ['#b6a1ff', '#74c7ff', '#f49be3'],
  ['#f49be3', '#b6a1ff', '#74c7ff'],
]

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '')
  const expanded = normalized.length === 3
    ? normalized
        .split('')
        .map((part) => `${part}${part}`)
        .join('')
    : normalized
  const number = Number.parseInt(expanded, 16)

  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255,
  }
}

function mixColors(colorA, colorB, ratio) {
  const safeRatio = clamp(ratio, 0, 1)
  const start = hexToRgb(colorA)
  const end = hexToRgb(colorB)

  return {
    r: Math.round(start.r + ((end.r - start.r) * safeRatio)),
    g: Math.round(start.g + ((end.g - start.g) * safeRatio)),
    b: Math.round(start.b + ((end.b - start.b) * safeRatio)),
  }
}

function toRgbaString(color, alpha) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
}

function getScrollProgress(element) {
  if (element === document.documentElement) {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      0,
    )

    return maxScroll > 0 ? window.scrollY / maxScroll : 0
  }

  const verticalMax = Math.max(element.scrollHeight - element.clientHeight, 0)
  const horizontalMax = Math.max(element.scrollWidth - element.clientWidth, 0)

  if (verticalMax >= horizontalMax && verticalMax > 0) {
    return element.scrollTop / verticalMax
  }

  if (horizontalMax > 0) {
    return element.scrollLeft / horizontalMax
  }

  return 0
}

function applyScrollbarVariables(element, palette, index) {
  const progress = getScrollProgress(element)
  const [primary, secondary, tertiary] = palette
  const indexShift = (index % SCROLLBAR_PALETTES.length) * 0.035
  const start = mixColors(
    primary,
    secondary,
    0.16 + (progress * 0.22) + indexShift,
  )
  const middle = mixColors(
    secondary,
    tertiary,
    0.14 + (Math.abs(progress - 0.5) * 0.18) + indexShift,
  )
  const end = mixColors(
    tertiary,
    primary,
    0.12 + ((1 - progress) * 0.24) + indexShift,
  )
  const hoverStart = mixColors(primary, tertiary, 0.24 + (progress * 0.18))
  const hoverMiddle = mixColors(secondary, primary, 0.2 + indexShift)
  const hoverEnd = mixColors(tertiary, secondary, 0.18 + ((1 - progress) * 0.16))
  const glow = mixColors(secondary, tertiary, 0.32 + (progress * 0.16))
  const angle = 148 + (progress * 74) + ((index % 4) * 11)
  const target = element === document.documentElement ? document.documentElement : element

  target.style.setProperty('--scrollbar-angle', `${Math.round(angle)}deg`)
  target.style.setProperty('--scrollbar-thumb-start', toRgbaString(start, 0.84))
  target.style.setProperty('--scrollbar-thumb-mid', toRgbaString(middle, 0.82))
  target.style.setProperty('--scrollbar-thumb-end', toRgbaString(end, 0.84))
  target.style.setProperty('--scrollbar-thumb-hover-start', toRgbaString(hoverStart, 0.94))
  target.style.setProperty('--scrollbar-thumb-hover-mid', toRgbaString(hoverMiddle, 0.92))
  target.style.setProperty('--scrollbar-thumb-hover-end', toRgbaString(hoverEnd, 0.94))
  target.style.setProperty('--scrollbar-thumb-color', toRgbaString(middle, 0.76))
  target.style.setProperty('--scrollbar-thumb-glow', toRgbaString(glow, 0.26))
}

function bindScrollbarGradient(element, palette, index) {
  let frameId = null

  const update = () => {
    frameId = null
    applyScrollbarVariables(element, palette, index)
  }

  const scheduleUpdate = () => {
    if (frameId !== null) {
      return
    }

    frameId = window.requestAnimationFrame(update)
  }

  const scrollTarget = element === document.documentElement ? window : element

  scheduleUpdate()
  scrollTarget.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)

  return () => {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId)
    }

    scrollTarget.removeEventListener('scroll', scheduleUpdate)
    window.removeEventListener('resize', scheduleUpdate)
  }
}

export default function useScrollbarGradients() {
  useEffect(() => {
    const cleanups = new Map()

    function collectTargets() {
      const targets = [
        document.documentElement,
        ...document.querySelectorAll(SCROLLBAR_SELECTOR),
      ]

      targets.forEach((target, index) => {
        if (cleanups.has(target)) {
          return
        }

        const palette = SCROLLBAR_PALETTES[index % SCROLLBAR_PALETTES.length]
        cleanups.set(target, bindScrollbarGradient(target, palette, index))
      })

      for (const [target, cleanup] of cleanups.entries()) {
        if (target === document.documentElement) {
          continue
        }

        if (!document.contains(target)) {
          cleanup()
          cleanups.delete(target)
        }
      }
    }

    collectTargets()

    const observer = new MutationObserver(() => {
      collectTargets()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
      cleanups.forEach((cleanup) => cleanup())
      cleanups.clear()
    }
  }, [])
}
