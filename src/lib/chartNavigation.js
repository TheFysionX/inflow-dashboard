function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function getChartKeyboardState({
  key,
  shiftKey = false,
  activeIndex = null,
  dragStartIndex = null,
  dragCurrentIndex = null,
  pointCount = 0,
}) {
  if (pointCount <= 0) {
    return null
  }

  const lastIndex = pointCount - 1
  const currentIndex = clamp(
    activeIndex ?? dragCurrentIndex ?? lastIndex,
    0,
    lastIndex,
  )

  if (key === 'Escape') {
    return {
      handled: true,
      activeIndex: null,
      dragStartIndex: null,
      dragCurrentIndex: null,
    }
  }

  if (key === 'Enter' || key === ' ') {
    if (dragStartIndex === null) {
      return {
        handled: true,
        activeIndex: currentIndex,
        dragStartIndex: currentIndex,
        dragCurrentIndex: currentIndex,
      }
    }

    return {
      handled: true,
      activeIndex: dragCurrentIndex ?? currentIndex,
      dragStartIndex: null,
      dragCurrentIndex: null,
    }
  }

  const nextIndexByKey = {
    ArrowLeft: currentIndex - 1,
    ArrowRight: currentIndex + 1,
    Home: 0,
    End: lastIndex,
  }

  if (!(key in nextIndexByKey)) {
    return null
  }

  const nextIndex = clamp(nextIndexByKey[key], 0, lastIndex)

  if (shiftKey) {
    return {
      handled: true,
      activeIndex: nextIndex,
      dragStartIndex: dragStartIndex ?? currentIndex,
      dragCurrentIndex: nextIndex,
    }
  }

  return {
    handled: true,
    activeIndex: nextIndex,
    dragStartIndex: null,
    dragCurrentIndex: null,
  }
}
