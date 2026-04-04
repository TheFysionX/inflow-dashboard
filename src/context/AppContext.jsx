import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

function buildIdleTransitionState() {
  return {
    active: false,
    label: 'Loading dashboard',
    mode: 'idle',
    startedAt: 0,
    targetPath: '',
    title: 'Syncing the next view',
    token: 0,
  }
}

function isSameRangeSelection(left, right) {
  return (
    left?.mode === right?.mode &&
    left?.preset === right?.preset &&
    left?.startDate === right?.startDate &&
    left?.endDate === right?.endDate
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
  const [routeTransition, setRouteTransition] = useState(() => buildIdleTransitionState())
  const transitionTimeoutRef = useRef(null)
  const transitionTokenRef = useRef(0)

  useEffect(
    () => () => {
      if (transitionTimeoutRef.current && typeof window !== 'undefined') {
        window.clearTimeout(transitionTimeoutRef.current)
      }
    },
    [],
  )

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
    const clearTransitionTimeout = () => {
      if (transitionTimeoutRef.current && typeof window !== 'undefined') {
        window.clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = null
      }
    }

    const beginUiTransition = ({
      label = 'Loading dashboard',
      mode = 'view',
      targetPath = '',
      title = 'Refreshing dashboard data',
    } = {}) => {
      const nextTransition = {
        active: true,
        label,
        mode,
        startedAt: Date.now(),
        targetPath,
        title,
        token: transitionTokenRef.current + 1,
      }

      transitionTokenRef.current = nextTransition.token
      clearTransitionTimeout()
      setRouteTransition(nextTransition)

      return nextTransition
    }

    const completeUiTransition = (token = routeTransition.token, minDuration = 0, startedAt = Date.now()) => {
      const finish = () => {
        setRouteTransition((current) => {
          if (!current.active || current.token !== token) {
            return current
          }

          return buildIdleTransitionState()
        })
      }

      clearTransitionTimeout()
      const remainingDelay = Math.max(0, minDuration - (Date.now() - startedAt))

      if (remainingDelay === 0 || typeof window === 'undefined') {
        finish()
        return
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        transitionTimeoutRef.current = null
        finish()
      }, remainingDelay)
    }

    const runViewTransition = (
      updateSession,
      {
        label = 'Loading dashboard',
        minDuration = 320,
        title = 'Refreshing dashboard data',
      } = {},
    ) => {
      const nextTransition = beginUiTransition({
        label,
        mode: 'view',
        title,
      })

      const commitUpdate = () => {
        startTransition(() => {
          updateSession()
        })

        completeUiTransition(
          nextTransition.token,
          minDuration,
          nextTransition.startedAt,
        )
      }

      if (typeof window === 'undefined') {
        commitUpdate()
        return
      }

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(commitUpdate)
      })
    }

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
      if (clientId === session.activeClientId) {
        return
      }

      runViewTransition(
        () => {
          setSession((current) => ({
            ...current,
            activeClientId: clientId,
          }))
        },
        {
          title: 'Switching client workspace',
        },
      )
    }

    const setRangePreset = (preset) => {
      const nextRangeSelection = buildPresetRangeSelection(preset)

      if (isSameRangeSelection(session.rangeSelection, nextRangeSelection)) {
        return
      }

      runViewTransition(
        () => {
          setSession((current) => ({
            ...current,
            rangeSelection: nextRangeSelection,
          }))
        },
        {
          title: 'Updating date range',
        },
      )
    }

    const setCustomRange = (from, to) => {
      const nextRangeSelection = buildCustomRangeSelection(from, to)

      if (isSameRangeSelection(session.rangeSelection, nextRangeSelection)) {
        return
      }

      runViewTransition(
        () => {
          setSession((current) => ({
            ...current,
            rangeSelection: nextRangeSelection,
          }))
        },
        {
          title: 'Applying custom range',
        },
      )
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
      const nextRangeSelection = buildPresetRangeSelection(defaultRangePreset)

      if (
        defaultRangePreset === session.defaultRangePreset &&
        isSameRangeSelection(session.rangeSelection, nextRangeSelection)
      ) {
        return
      }

      runViewTransition(
        () => {
          setSession((current) => ({
            ...current,
            defaultRangePreset,
            rangeSelection: nextRangeSelection,
          }))
        },
        {
          title: 'Updating date range',
        },
      )
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
      return beginUiTransition({
        label: 'Loading dashboard',
        mode: 'route',
        targetPath,
        title: 'Syncing the next view',
      })
    }

    const completeRouteTransition = () => {
      completeUiTransition(routeTransition.token, 260, routeTransition.startedAt)
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
      routeTransitionLabel: routeTransition.label,
      routeTransitionMode: routeTransition.mode,
      routeTransitionStartedAt: routeTransition.startedAt,
      routeTransitionTargetPath: routeTransition.targetPath,
      routeTransitionTitle: routeTransition.title,
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
