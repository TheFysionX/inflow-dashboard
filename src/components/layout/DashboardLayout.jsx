import { Outlet } from 'react-router-dom'
import { useDashboard } from '../../context/AppContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout() {
  const { clients, activeClientId } = useDashboard()
  const activeClient =
    clients.find((client) => client.id === activeClientId) ?? clients[0]

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
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
