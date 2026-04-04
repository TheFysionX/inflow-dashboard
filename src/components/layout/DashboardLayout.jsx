import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import RouteLoader from '../ui/RouteLoader'
import { useDashboard } from '../../context/AppContext'
import { scrollToSearchTarget } from '../../lib/searchNavigation'
import useScrollbarGradients from '../../lib/useScrollbarGradients'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout() {
  const {
    clients,
    activeClientId,
    completeRouteTransition,
    routeTransitionLabel,
    routeTransitionActive,
    routeTransitionMode,
    routeTransitionStartedAt,
    routeTransitionTargetPath,
    routeTransitionTitle,
  } = useDashboard()
  const location = useLocation()
  const contentRef = useRef(null)
  const activeClient =
    clients.find((client) => client.id === activeClientId) ?? clients[0]

  useScrollbarGradients()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    contentRef.current?.scrollTo?.({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '')

    if (!hash) {
      return
    }

    scrollToSearchTarget(hash)
  }, [location.hash, location.pathname])

  useEffect(() => {
    if (!routeTransitionActive) {
      return undefined
    }

    if (routeTransitionMode !== 'route') {
      return undefined
    }

    if (
      routeTransitionTargetPath &&
      routeTransitionTargetPath !== location.pathname
    ) {
      return undefined
    }

    const elapsed = Date.now() - routeTransitionStartedAt
    const timeoutId = window.setTimeout(
      () => {
        completeRouteTransition()
      },
      Math.max(0, 260 - elapsed),
    )

    return () => window.clearTimeout(timeoutId)
  }, [
    completeRouteTransition,
    routeTransitionMode,
    location.pathname,
    routeTransitionActive,
    routeTransitionStartedAt,
    routeTransitionTargetPath,
  ])

  return (
    <div
      className="dashboard-shell"
      style={{
        '--client-accent': activeClient.accent,
        '--client-accent-soft': activeClient.accentSoft,
        '--client-accent-glow': activeClient.accentGlow,
      }}
    >
      <Sidebar />
      <div className="dashboard-main">
        <Topbar />
        <div className="dashboard-content" ref={contentRef}>
          <Outlet />
          {routeTransitionActive ? (
            <div className="dashboard-route-overlay">
              <RouteLoader
                className="route-loader-shell--overlay"
                label={routeTransitionLabel}
                title={routeTransitionTitle}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
