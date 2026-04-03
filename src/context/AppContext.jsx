import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  DEFAULT_OVERVIEW_METRIC_SLOTS,
  DEFAULT_OVERVIEW_WIDGET_SLOTS,
  normalizeOverviewMetricSlots,
  normalizeOverviewWidgetSlots,
} from '../config/overviewLayout'
import { demoDataset } from '../data/demoData'
import {
  buildCustomRangeSelection,
  DEFAULT_RANGE_PRESET,
  buildPresetRangeSelection,
  normalizeRangeSelection,
} from '../lib/rangeSelection'
import {
  getDemoAccessAccountById,
  primaryDemoAccess,
} from '../config/demoAccess'

const DashboardContext = createContext(null)
const SESSION_KEY = 'inflow.dashboard.session.v7'

function getDefaultSession() {
  return {
    isAuthenticated: false,
    activeClientId: demoDataset.clients[0]?.id ?? '',
    activeAccountId: primaryDemoAccess.id,
    defaultLandingPath: '/overview',
    defaultRangePreset: DEFAULT_RANGE_PRESET,
    numberFormat: 'compact',
    rangeSelection: buildPresetRangeSelection(DEFAULT_RANGE_PRESET),
    sidebarExpanded: false,
    overviewMetricSlots: [...DEFAULT_OVERVIEW_METRIC_SLOTS],
    overviewCustomizerOpen: false,
    overviewWidgetSlots: [...DEFAULT_OVERVIEW_WIDGET_SLOTS],
  }
}

function getInitialSession() {
  if (typeof window === 'undefined') {
    return getDefaultSession()
  }

  try {
    const rawSession = window.localStorage.getItem(SESSION_KEY)

    if (!rawSession) {
      return getDefaultSession()
    }

    const parsedSession = JSON.parse(rawSession)
    const { overviewUseCompactNumbers: legacyCompactPreference, ...restParsedSession } =
      parsedSession
    const normalizedRangeSelection = normalizeRangeSelection(
      parsedSession?.rangeSelection ?? parsedSession?.dateRange,
    )
    const defaultRangePreset =
      typeof parsedSession?.defaultRangePreset === 'string'
        ? parsedSession.defaultRangePreset
        : normalizedRangeSelection.mode === 'preset'
          ? normalizedRangeSelection.preset
          : DEFAULT_RANGE_PRESET
    const numberFormat =
      parsedSession?.numberFormat ??
      (legacyCompactPreference === false ? 'full' : 'compact')

    return {
      ...getDefaultSession(),
      ...restParsedSession,
      activeAccountId: getDemoAccessAccountById(parsedSession?.activeAccountId).id,
      defaultLandingPath:
        typeof parsedSession?.defaultLandingPath === 'string' &&
        parsedSession.defaultLandingPath.length
          ? parsedSession.defaultLandingPath
          : '/overview',
      defaultRangePreset,
      numberFormat,
      rangeSelection: normalizedRangeSelection,
      overviewMetricSlots: normalizeOverviewMetricSlots(
        parsedSession?.overviewMetricSlots,
      ),
      overviewWidgetSlots: normalizeOverviewWidgetSlots(
        parsedSession?.overviewWidgetSlots,
      ),
    }
  } catch {
    return getDefaultSession()
  }
}

export function AppProvider({ children }) {
  const [session, setSession] = useState(getInitialSession)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }, [session])

  const value = useMemo(() => {
    const useCompactNumbers = session.numberFormat !== 'full'
    const currentAccount = getDemoAccessAccountById(session.activeAccountId)

    const login = ({
      accountId = session.activeAccountId,
      clientId = session.activeClientId,
    } = {}) => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          isAuthenticated: true,
          activeAccountId: getDemoAccessAccountById(accountId).id,
          activeClientId: clientId || current.activeClientId,
        }))
      })
    }

    const logout = () => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          isAuthenticated: false,
        }))
      })
    }

    const setActiveClientId = (clientId) => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          activeClientId: clientId,
        }))
      })
    }

    const setRangePreset = (preset) => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          rangeSelection: buildPresetRangeSelection(preset),
        }))
      })
    }

    const setCustomRange = (from, to) => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          rangeSelection: buildCustomRangeSelection(from, to),
        }))
      })
    }

    const setDefaultLandingPath = (defaultLandingPath) => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          defaultLandingPath,
        }))
      })
    }

    const setDefaultRangePreset = (defaultRangePreset) => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          defaultRangePreset,
          rangeSelection: buildPresetRangeSelection(defaultRangePreset),
        }))
      })
    }

    const setNumberFormat = (numberFormat) => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          numberFormat,
        }))
      })
    }

    const setSidebarExpanded = (sidebarExpanded) => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          sidebarExpanded,
        }))
      })
    }

    const toggleSidebar = () => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          sidebarExpanded: !current.sidebarExpanded,
        }))
      })
    }

    const setOverviewMetricSlot = (slotIndex, metricKey) => {
      startTransition(() => {
        setSession((current) => {
          const nextSlots = normalizeOverviewMetricSlots(current.overviewMetricSlots)
          nextSlots[slotIndex] = metricKey

          return {
            ...current,
            overviewMetricSlots: normalizeOverviewMetricSlots(nextSlots),
          }
        })
      })
    }

    const resetOverviewMetricSlots = () => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          overviewMetricSlots: [...DEFAULT_OVERVIEW_METRIC_SLOTS],
        }))
      })
    }

    const setOverviewCustomizerOpen = (overviewCustomizerOpen) => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          overviewCustomizerOpen,
        }))
      })
    }

    const setOverviewUseCompactNumbers = (overviewUseCompactNumbers) => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          numberFormat: overviewUseCompactNumbers ? 'compact' : 'full',
        }))
      })
    }

    const setOverviewWidgetSlot = (slotIndex, widgetKey) => {
      startTransition(() => {
        setSession((current) => {
          const nextSlots = [...normalizeOverviewWidgetSlots(current.overviewWidgetSlots)]

          if (nextSlots.includes(widgetKey) && nextSlots[slotIndex] !== widgetKey) {
            return current
          }

          nextSlots[slotIndex] = widgetKey

          return {
            ...current,
            overviewWidgetSlots: normalizeOverviewWidgetSlots(nextSlots),
          }
        })
      })
    }

    const resetOverviewWidgetSlots = () => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          overviewWidgetSlots: [...DEFAULT_OVERVIEW_WIDGET_SLOTS],
        }))
      })
    }

    return {
      ...session,
      clients: demoDataset.clients,
      currentAccount,
      dataset: demoDataset,
      defaultLandingPath: session.defaultLandingPath,
      defaultRangePreset: session.defaultRangePreset,
      login,
      logout,
      setActiveClientId,
      setCustomRange,
      setDefaultLandingPath,
      setDefaultRangePreset,
      setNumberFormat,
      setOverviewCustomizerOpen,
      setOverviewMetricSlot,
      setOverviewUseCompactNumbers,
      setOverviewWidgetSlot,
      setRangePreset,
      setSidebarExpanded,
      numberFormat: session.numberFormat,
      overviewUseCompactNumbers: useCompactNumbers,
      resetOverviewMetricSlots,
      resetOverviewWidgetSlots,
      toggleSidebar,
      useCompactNumbers,
    }
  }, [session])

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)

  if (!context) {
    throw new Error('useDashboard must be used inside AppProvider')
  }

  return context
}
