function clearHighlight(target) {
  target.classList.remove('is-search-highlight')
}

export function scrollToSearchTarget(sectionId, behavior = 'smooth') {
  if (typeof document === 'undefined' || !sectionId) {
    return false
  }

  const target = document.getElementById(sectionId)

  if (!target) {
    return false
  }

  window.requestAnimationFrame(() => {
    target.scrollIntoView({
      behavior,
      block: 'start',
      inline: 'nearest',
    })

    clearHighlight(target)
    void target.offsetWidth
    target.classList.add('is-search-highlight')
    window.setTimeout(() => clearHighlight(target), 1300)
  })

  return true
}
