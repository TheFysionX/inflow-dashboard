import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AppProvider } from '../context/AppContext'
import BookingsPage from './BookingsPage'
import ObjectionsPage from './ObjectionsPage'
import PerformancePage from './PerformancePage'
import SettingsPage from './SettingsPage'

describe('operational stage pages', () => {
  it('renders objections without crashing', () => {
    const markup = renderToString(
      <AppProvider>
        <ObjectionsPage />
      </AppProvider>,
    )

    expect(markup).toContain('Objection')
  })

  it('renders bookings without crashing', () => {
    const markup = renderToString(
      <AppProvider>
        <BookingsPage />
      </AppProvider>,
    )

    expect(markup).toContain('Booking')
  })

  it('renders performance without crashing', () => {
    const markup = renderToString(
      <AppProvider>
        <PerformancePage />
      </AppProvider>,
    )

    expect(markup).toContain('Review score trend')
  })

  it('renders settings without crashing', () => {
    const markup = renderToString(
      <AppProvider>
        <SettingsPage />
      </AppProvider>,
    )

    expect(markup).toContain('Workspace identity')
  })
})
