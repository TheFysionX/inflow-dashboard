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
const LEGACY_OVERVIEW_METRIC_SLOTS = [
  'totalLeads',
  'activeConversations',
  'qualifiedLeads',
  'unqualifiedLeads',
  'bookingIntent',
  'confirmedCalls',
  'conversionRate',
  'avgReplyQuality',
]
const LEGACY_OVERVIEW_WIDGET_SLOTS = [
  'funnel',
  'qualificationBreakdown',
  'leadTrend',
  'bookingTrend',
  'objectionDistribution',
  'needsAttention',
  'upcomingCalls',
  'topIssues',
]
const PREVIOUS_OPERATOR_OVERVIEW_WIDGET_SLOTS = [
  'funnel',
  'needsAttention',
  'upcomingCalls',
  'topIssues',
  'objectionDistribution',
  'leadTrend',
  'bookingTrend',
  'qualificationBreakdown',
]

function matchesLegacyDefaults(currentSlots = [], legacySlots = []) {
  return (
    currentSlots.length === legacySlots.length &&
    currentSlots.every((slot, index) => slot === legacySlots[index])
  )
}

function getDefaultSession(initialDataset) {
  return {
    isAuthenticated: false,
    activeClientId: initialDataset?.clients?.[0]?.id ?? '',
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

function getInitialSession(initialDataset) {
  if (typeof window === 'undefined') {
    return getDefaultSession(initialDataset)
  }

  try {
    const rawSession = window.localStorage.getItem(SESSION_KEY)

    if (!rawSession) {
      return getDefaultSession(initialDataset)
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
      ...getDefaultSession(initialDataset),
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
      overviewMetricSlots: matchesLegacyDefaults(
        parsedSession?.overviewMetricSlots ?? [],
        LEGACY_OVERVIEW_METRIC_SLOTS,
      )
        ? [...DEFAULT_OVERVIEW_METRIC_SLOTS]
        : normalizeOverviewMetricSlots(parsedSession?.overviewMetricSlots),
      overviewWidgetSlots: matchesLegacyDefaults(
        parsedSession?.overviewWidgetSlots ?? [],
        LEGACY_OVERVIEW_WIDGET_SLOTS,
      )
        || matchesLegacyDefaults(
          parsedSession?.overviewWidgetSlots ?? [],
          PREVIOUS_OPERATOR_OVERVIEW_WIDGET_SLOTS,
        )
        ? [...DEFAULT_OVERVIEW_WIDGET_SLOTS]
        : normalizeOverviewWidgetSlots(parsedSession?.overviewWidgetSlots),
    }
  } catch {
    return getDefaultSession(initialDataset)
  }
}

export function AppProvider({ children, initialDataset = null }) {
  const [dataset, setDataset] = useState(initialDataset)
  const [session, setSession] = useState(() => getInitialSession(initialDataset))
  const [routeTransition, setRouteTransition] = useState({
    active: false,
    startedAt: 0,
    targetPath: '',
  })

  useEffect(() => {
    let cancelled = false

    if (dataset || !session.isAuthenticated) {
      return () => {
        cancelled = true
      }
    }

    import('../data/demoData').then((module) => {
      if (cancelled) {
        return
      }

      setDataset(module.demoDataset)
    })

    return () => {
      cancelled = true
    }
  }, [dataset, session.isAuthenticated])

  useEffect(() => {
    if (!dataset?.clients?.length || session.activeClientId) {
      return
    }

    startTransition(() => {
      setSession((current) => ({
        ...current,
        activeClientId: dataset.clients[0]?.id ?? current.activeClientId,
      }))
    })
  }, [dataset, session.activeClientId])

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

    const startRouteTransition = (targetPath = '') => {
      setRouteTransition({
        active: true,
        startedAt: Date.now(),
        targetPath,
      })
    }

    const completeRouteTransition = () => {
      setRouteTransition((current) =>
        current.active
          ? {
              active: false,
              startedAt: 0,
              targetPath: '',
            }
          : current,
      )
    }

    return {
      ...session,
      clients: dataset?.clients ?? [],
      currentAccount,
      dataset,
      datasetReady: Boolean(dataset),
      defaultLandingPath: session.defaultLandingPath,
      defaultRangePreset: session.defaultRangePreset,
      completeRouteTransition,
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
      routeTransitionActive: routeTransition.active,
      routeTransitionStartedAt: routeTransition.startedAt,
      routeTransitionTargetPath: routeTransition.targetPath,
      startRouteTransition,
      toggleSidebar,
      useCompactNumbers,
    }
  }, [dataset, routeTransition, session])

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
