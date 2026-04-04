import { startTransition } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDashboard } from '../context/AppContext'

function buildTargetPath(to, location) {
  if (typeof to === 'string') {
    return to
  }

  const pathname = to?.pathname ?? location.pathname
  const search = to?.search ?? ''
  const hash = to?.hash ?? ''

  return `${pathname}${search}${hash}`
}

function stripSearchAndHash(pathname = '') {
  return pathname.split('#')[0].split('?')[0]
}

export default function useDashboardNavigate() {
  const location = useLocation()
  const navigate = useNavigate()
  const { startRouteTransition } = useDashboard()

  return (to, options) => {
    const currentTarget = `${location.pathname}${location.search}${location.hash}`
    const nextTarget = buildTargetPath(to, location)
    const currentPathOnly = stripSearchAndHash(currentTarget)
    const nextPathOnly = stripSearchAndHash(nextTarget)

    if (nextTarget === currentTarget) {
      return
    }

    if (currentPathOnly === nextPathOnly) {
      navigate(to, options)
      return
    }

    flushSync(() => {
      startRouteTransition(nextPathOnly)
    })

    const commitNavigation = () => {
      startTransition(() => {
        navigate(to, options)
      })
    }

    if (typeof window === 'undefined') {
      commitNavigation()
      return
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(commitNavigation)
    })
  }
}
