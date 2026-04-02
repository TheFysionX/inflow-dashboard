import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import { AppProvider, useDashboard } from './context/AppContext'
import { navigationItems } from './config/navigation'
import BookingsPage from './pages/BookingsPage'
import ConversationsPage from './pages/ConversationsPage'
import LeadsPage from './pages/LeadsPage'
import LoginPage from './pages/LoginPage'
import ObjectionsPage from './pages/ObjectionsPage'
import OverviewPage from './pages/OverviewPage'
import PerformancePage from './pages/PerformancePage'
import PipelinePage from './pages/PipelinePage'
import PlaceholderPage from './pages/PlaceholderPage'
import SettingsPage from './pages/SettingsPage'

function getProtectedLandingPath(defaultLandingPath) {
  return navigationItems.some((item) => item.path === defaultLandingPath)
    ? defaultLandingPath
    : '/overview'
}

function ProtectedApp() {
  const { isAuthenticated } = useDashboard()

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  return <DashboardLayout />
}

function LoginRoute() {
  const { defaultLandingPath, isAuthenticated } = useDashboard()

  if (isAuthenticated) {
    return <Navigate replace to={getProtectedLandingPath(defaultLandingPath)} />
  }

  return <LoginPage />
}

function RootRedirect() {
  const { defaultLandingPath, isAuthenticated } = useDashboard()

  return <Navigate replace to={isAuthenticated ? getProtectedLandingPath(defaultLandingPath) : '/login'} />
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
        <Route element={<ConversationsPage />} path="conversations" />
        <Route element={<ObjectionsPage />} path="objections" />
        <Route element={<BookingsPage />} path="bookings" />
        <Route element={<PerformancePage />} path="performance" />
        <Route element={<SettingsPage />} path="settings" />
        {navigationItems
          .filter((item) => !['/overview', '/pipeline', '/leads', '/conversations', '/objections', '/bookings', '/performance', '/settings'].includes(item.path))
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
