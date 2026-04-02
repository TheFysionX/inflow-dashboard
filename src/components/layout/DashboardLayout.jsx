import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useDashboard } from '../../context/AppContext'
import { scrollToSearchTarget } from '../../lib/searchNavigation'
import useScrollbarGradients from '../../lib/useScrollbarGradients'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout() {
  const { clients, activeClientId } = useDashboard()
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
        </div>
      </div>
    </div>
  )
}
