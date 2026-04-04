import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import RouteLoader from './components/ui/RouteLoader'
import { AppProvider, useDashboard } from './context/AppContext'
import { navigationItems } from './config/navigation'

const BookingsPage = lazy(() => import('./pages/BookingsPage'))
const ConversationsPage = lazy(() => import('./pages/ConversationsPage'))
const LeadsPage = lazy(() => import('./pages/LeadsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ObjectionsPage = lazy(() => import('./pages/ObjectionsPage'))
const OverviewPage = lazy(() => import('./pages/OverviewPage'))
const PerformancePage = lazy(() => import('./pages/PerformancePage'))
const PipelinePage = lazy(() => import('./pages/PipelinePage'))
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function RouteFallback() {
  return <RouteLoader />
}

function renderLazyPage(PageComponent, props = {}) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <PageComponent {...props} />
    </Suspense>
  )
}

function getProtectedLandingPath(defaultLandingPath) {
  return navigationItems.some((item) => item.path === defaultLandingPath)
    ? defaultLandingPath
    : '/overview'
}

function ProtectedApp() {
  const { datasetReady, isAuthenticated } = useDashboard()

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  if (!datasetReady) {
    return <RouteFallback />
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
      <Route element={renderLazyPage(LoginRoute)} path="/login" />
      <Route element={<ProtectedApp />} path="/">
        <Route element={renderLazyPage(OverviewPage)} path="overview" />
        <Route element={renderLazyPage(PipelinePage)} path="pipeline" />
        <Route element={renderLazyPage(LeadsPage)} path="leads" />
        <Route element={renderLazyPage(ConversationsPage)} path="conversations" />
        <Route element={renderLazyPage(ObjectionsPage)} path="objections" />
        <Route element={renderLazyPage(BookingsPage)} path="bookings" />
        <Route element={renderLazyPage(PerformancePage)} path="performance" />
        <Route element={renderLazyPage(SettingsPage)} path="settings" />
        {navigationItems
          .filter((item) => !['/overview', '/pipeline', '/leads', '/conversations', '/objections', '/bookings', '/performance', '/settings'].includes(item.path))
          .map((item) => (
            <Route
              element={renderLazyPage(PlaceholderPage, { routePath: item.path })}
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
