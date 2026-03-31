import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import { AppProvider, useDashboard } from './context/AppContext'
import { navigationItems } from './config/navigation'
import LeadsPage from './pages/LeadsPage'
import LoginPage from './pages/LoginPage'
import OverviewPage from './pages/OverviewPage'
import PipelinePage from './pages/PipelinePage'
import PlaceholderPage from './pages/PlaceholderPage'

function ProtectedApp() {
  const { isAuthenticated } = useDashboard()

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  return <DashboardLayout />
}

function LoginRoute() {
  const { isAuthenticated } = useDashboard()

  if (isAuthenticated) {
    return <Navigate replace to="/overview" />
  }

  return <LoginPage />
}

function RootRedirect() {
  const { isAuthenticated } = useDashboard()

  return <Navigate replace to={isAuthenticated ? '/overview' : '/login'} />
}

function DashboardRoutes() {
  return (
    <Routes>
      <Route element={<RootRedirect />} path="/" />
      <Route element={<LoginRoute />} path="/login" />
      <Route element={<ProtectedApp />} path="/">
        <Route element={<OverviewPage />} path="overview" />
        <Route element={<PipelinePage />} path="pipeline" />
        <Route element={<LeadsPage />} path="leads" />
        {navigationItems
          .filter((item) => !['/overview', '/pipeline', '/leads'].includes(item.path))
          .map((item) => (
            <Route
              element={<PlaceholderPage routePath={item.path} />}
              key={item.path}
              path={item.path.slice(1)}
            />
          ))}
      </Route>
      <Route element={<RootRedirect />} path="*" />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <DashboardRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
