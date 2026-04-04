import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { demoDataset } from '../data/demoData'
import BookingsPage from './BookingsPage'
import ConversationsPage from './ConversationsPage'
import LeadsPage from './LeadsPage'
import ObjectionsPage from './ObjectionsPage'
import OverviewPage from './OverviewPage'
import PerformancePage from './PerformancePage'
import PipelinePage from './PipelinePage'
import SettingsPage from './SettingsPage'

describe('operational stage pages', () => {
  function renderInDashboard(element) {
    return renderToString(
      <MemoryRouter>
        <AppProvider initialDataset={demoDataset}>{element}</AppProvider>
      </MemoryRouter>,
    )
  }

  it('renders overview without crashing', () => {
    const markup = renderInDashboard(<OverviewPage />)

    expect(markup).toContain('This week in Inflow')
  })

  it('renders pipeline without crashing', () => {
    const markup = renderInDashboard(<PipelinePage />)

    expect(markup).toContain('Stage distribution')
  })

  it('renders leads without crashing', () => {
    const markup = renderInDashboard(<LeadsPage />)

    expect(markup).toContain('Lead database')
  })

  it('renders conversations without crashing', () => {
    const markup = renderInDashboard(<ConversationsPage />)

    expect(markup).toContain('Recent threads')
  })

  it('renders objections without crashing', () => {
    const markup = renderInDashboard(<ObjectionsPage />)

    expect(markup).toContain('Objection')
  })

  it('renders bookings without crashing', () => {
    const markup = renderInDashboard(<BookingsPage />)

    expect(markup).toContain('Booking')
  })

  it('renders performance without crashing', () => {
    const markup = renderInDashboard(<PerformancePage />)

    expect(markup).toContain('Review score trend')
  })

  it('renders settings without crashing', () => {
    const markup = renderInDashboard(<SettingsPage />)

    expect(markup).toContain('Workspace identity')
  })
})
