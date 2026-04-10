import {
  createContext,
  startTransition,
  useCallback,
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

const DashboardAuthContext = createContext(null)
const DashboardDatasetContext = createContext(null)
const DashboardSelectionContext = createContext(null)
const DashboardPreferencesContext = createContext(null)
const DashboardLayoutContext = createContext(null)
const DashboardRouteTransitionContext = createContext(null)
const DashboardActionsContext = createContext(null)

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
      ) ||
        matchesLegacyDefaults(
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

function useRequiredContext(context, hookName) {
  const value = useContext(context)

  if (!value) {
    throw new Error(`${hookName} must be used inside AppProvider`)
  }

  return value
}

export function AppProvider({ children, initialDataset = null }) {
  const [dataset, setDataset] = useState(initialDataset)
  const [session, setSession] = useState(() => getInitialSession(initialDataset))
  const [routeTransition, setRouteTransition] = useState(() => buildIdleTransitionState())
  const transitionTimeoutRef = useRef(null)
  const transitionTokenRef = useRef(0)
  const sessionRef = useRef(session)
  const routeTransitionRef = useRef(routeTransition)

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    routeTransitionRef.current = routeTransition
  }, [routeTransition])

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
    let worker = null

    if (dataset || !session.isAuthenticated) {
      return () => {
        cancelled = true
        worker?.terminate?.()
      }
    }

    const commitDataset = (nextDataset) => {
      if (!cancelled) {
        setDataset(nextDataset)
      }
    }

    const loadOnMainThread = async () => {
      const response = await fetch('/demo-data.json')

      if (!response.ok) {
        throw new Error('Unable to load demo dataset.')
      }

      commitDataset(await response.json())
    }

    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      loadOnMainThread().catch(() => {})

      return () => {
        cancelled = true
      }
    }

    worker = new Worker(
      new URL('../workers/demoDataset.worker.js', import.meta.url),
      { type: 'module' },
    )

    worker.addEventListener('message', (event) => {
      if (event.data?.type !== 'loaded') {
        return
      }

      worker?.terminate?.()
      worker = null
      commitDataset(event.data.dataset)
    })

    worker.addEventListener('error', () => {
      worker?.terminate?.()
      worker = null
      loadOnMainThread().catch(() => {})
    })

    worker.postMessage({ type: 'load' })

    return () => {
      cancelled = true
      worker?.terminate?.()
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

  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current && typeof window !== 'undefined') {
      window.clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
  }, [])

  const beginUiTransition = useCallback(
    ({
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
    },
    [clearTransitionTimeout],
  )

  const completeUiTransition = useCallback(
    (
      token = routeTransitionRef.current.token,
      minDuration = 0,
      startedAt = Date.now(),
    ) => {
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
    },
    [clearTransitionTimeout],
  )

  const runViewTransition = useCallback(
    (
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
    },
    [beginUiTransition, completeUiTransition],
  )

  const login = useCallback(
    ({
      accountId = sessionRef.current.activeAccountId,
      clientId = sessionRef.current.activeClientId,
    } = {}) => {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          isAuthenticated: true,
          activeAccountId: getDemoAccessAccountById(accountId).id,
          activeClientId: clientId || current.activeClientId,
        }))
      })
    },
    [],
  )

  const logout = useCallback(() => {
    startTransition(() => {
      setSession((current) => (
        current.isAuthenticated
          ? {
              ...current,
              isAuthenticated: false,
            }
          : current
      ))
    })
  }, [])

  const setActiveClientId = useCallback(
    (clientId) => {
      if (clientId === sessionRef.current.activeClientId) {
        return
      }

      runViewTransition(
        () => {
          setSession((current) => (
            current.activeClientId === clientId
              ? current
              : {
                  ...current,
                  activeClientId: clientId,
                }
          ))
        },
        {
          title: 'Switching client workspace',
        },
      )
    },
    [runViewTransition],
  )

  const setRangePreset = useCallback(
    (preset) => {
      const nextRangeSelection = buildPresetRangeSelection(preset)

      if (isSameRangeSelection(sessionRef.current.rangeSelection, nextRangeSelection)) {
        return
      }

      runViewTransition(
        () => {
          setSession((current) => (
            isSameRangeSelection(current.rangeSelection, nextRangeSelection)
              ? current
              : {
                  ...current,
                  rangeSelection: nextRangeSelection,
                }
          ))
        },
        {
          title: 'Updating date range',
        },
      )
    },
    [runViewTransition],
  )

  const setCustomRange = useCallback(
    (from, to) => {
      const nextRangeSelection = buildCustomRangeSelection(from, to)

      if (isSameRangeSelection(sessionRef.current.rangeSelection, nextRangeSelection)) {
        return
      }

      runViewTransition(
        () => {
          setSession((current) => (
            isSameRangeSelection(current.rangeSelection, nextRangeSelection)
              ? current
              : {
                  ...current,
                  rangeSelection: nextRangeSelection,
                }
          ))
        },
        {
          title: 'Applying custom range',
        },
      )
    },
    [runViewTransition],
  )

  const setDefaultLandingPath = useCallback((defaultLandingPath) => {
    startTransition(() => {
      setSession((current) => (
        current.defaultLandingPath === defaultLandingPath
          ? current
          : {
              ...current,
              defaultLandingPath,
            }
      ))
    })
  }, [])

  const setDefaultRangePreset = useCallback(
    (defaultRangePreset) => {
      const nextRangeSelection = buildPresetRangeSelection(defaultRangePreset)

      if (
        defaultRangePreset === sessionRef.current.defaultRangePreset &&
        isSameRangeSelection(sessionRef.current.rangeSelection, nextRangeSelection)
      ) {
        return
      }

      runViewTransition(
        () => {
          setSession((current) => (
            current.defaultRangePreset === defaultRangePreset &&
            isSameRangeSelection(current.rangeSelection, nextRangeSelection)
              ? current
              : {
                  ...current,
                  defaultRangePreset,
                  rangeSelection: nextRangeSelection,
                }
          ))
        },
        {
          title: 'Updating date range',
        },
      )
    },
    [runViewTransition],
  )

  const setNumberFormat = useCallback((numberFormat) => {
    startTransition(() => {
      setSession((current) => (
        current.numberFormat === numberFormat
          ? current
          : {
              ...current,
              numberFormat,
            }
      ))
    })
  }, [])

  const setSidebarExpanded = useCallback((sidebarExpanded) => {
    startTransition(() => {
      setSession((current) => (
        current.sidebarExpanded === sidebarExpanded
          ? current
          : {
              ...current,
              sidebarExpanded,
            }
      ))
    })
  }, [])

  const toggleSidebar = useCallback(() => {
    startTransition(() => {
      setSession((current) => ({
        ...current,
        sidebarExpanded: !current.sidebarExpanded,
      }))
    })
  }, [])

  const setOverviewMetricSlot = useCallback((slotIndex, metricKey) => {
    startTransition(() => {
      setSession((current) => {
        const nextSlots = normalizeOverviewMetricSlots(current.overviewMetricSlots)

        if (nextSlots[slotIndex] === metricKey) {
          return current
        }

        nextSlots[slotIndex] = metricKey

        return {
          ...current,
          overviewMetricSlots: normalizeOverviewMetricSlots(nextSlots),
        }
      })
    })
  }, [])

  const resetOverviewMetricSlots = useCallback(() => {
    startTransition(() => {
      setSession((current) => (
        current.overviewMetricSlots.every(
          (slot, index) => slot === DEFAULT_OVERVIEW_METRIC_SLOTS[index],
        )
          ? current
          : {
              ...current,
              overviewMetricSlots: [...DEFAULT_OVERVIEW_METRIC_SLOTS],
            }
      ))
    })
  }, [])

  const setOverviewCustomizerOpen = useCallback((overviewCustomizerOpen) => {
    startTransition(() => {
      setSession((current) => (
        current.overviewCustomizerOpen === overviewCustomizerOpen
          ? current
          : {
              ...current,
              overviewCustomizerOpen,
            }
      ))
    })
  }, [])

  const setOverviewUseCompactNumbers = useCallback((overviewUseCompactNumbers) => {
    const nextNumberFormat = overviewUseCompactNumbers ? 'compact' : 'full'

    startTransition(() => {
      setSession((current) => (
        current.numberFormat === nextNumberFormat
          ? current
          : {
              ...current,
              numberFormat: nextNumberFormat,
            }
      ))
    })
  }, [])

  const setOverviewWidgetSlot = useCallback((slotIndex, widgetKey) => {
    startTransition(() => {
      setSession((current) => {
        const nextSlots = [...normalizeOverviewWidgetSlots(current.overviewWidgetSlots)]

        if (nextSlots.includes(widgetKey) && nextSlots[slotIndex] !== widgetKey) {
          return current
        }

        if (nextSlots[slotIndex] === widgetKey) {
          return current
        }

        nextSlots[slotIndex] = widgetKey

        return {
          ...current,
          overviewWidgetSlots: normalizeOverviewWidgetSlots(nextSlots),
        }
      })
    })
  }, [])

  const resetOverviewWidgetSlots = useCallback(() => {
    startTransition(() => {
      setSession((current) => (
        current.overviewWidgetSlots.every(
          (slot, index) => slot === DEFAULT_OVERVIEW_WIDGET_SLOTS[index],
        )
          ? current
          : {
              ...current,
              overviewWidgetSlots: [...DEFAULT_OVERVIEW_WIDGET_SLOTS],
            }
      ))
    })
  }, [])

  const startRouteTransition = useCallback(
    (targetPath = '') =>
      beginUiTransition({
        label: 'Loading dashboard',
        mode: 'route',
        targetPath,
        title: 'Syncing the next view',
      }),
    [beginUiTransition],
  )

  const completeRouteTransition = useCallback(() => {
    const currentTransition = routeTransitionRef.current

    completeUiTransition(
      currentTransition.token,
      260,
      currentTransition.startedAt,
    )
  }, [completeUiTransition])

  const currentAccount = useMemo(
    () => getDemoAccessAccountById(session.activeAccountId),
    [session.activeAccountId],
  )
  const overviewUseCompactNumbers = session.numberFormat !== 'full'

  const authValue = useMemo(
    () => ({
      activeAccountId: session.activeAccountId,
      currentAccount,
      isAuthenticated: session.isAuthenticated,
    }),
    [currentAccount, session.activeAccountId, session.isAuthenticated],
  )

  const datasetValue = useMemo(
    () => ({
      clients: dataset?.clients ?? [],
      dataset,
      datasetReady: Boolean(dataset),
    }),
    [dataset],
  )

  const selectionValue = useMemo(
    () => ({
      activeClientId: session.activeClientId,
      rangeSelection: session.rangeSelection,
    }),
    [session.activeClientId, session.rangeSelection],
  )

  const preferencesValue = useMemo(
    () => ({
      defaultLandingPath: session.defaultLandingPath,
      defaultRangePreset: session.defaultRangePreset,
      numberFormat: session.numberFormat,
      overviewCustomizerOpen: session.overviewCustomizerOpen,
      overviewMetricSlots: session.overviewMetricSlots,
      overviewUseCompactNumbers,
      overviewWidgetSlots: session.overviewWidgetSlots,
      useCompactNumbers: overviewUseCompactNumbers,
    }),
    [
      overviewUseCompactNumbers,
      session.defaultLandingPath,
      session.defaultRangePreset,
      session.numberFormat,
      session.overviewCustomizerOpen,
      session.overviewMetricSlots,
      session.overviewWidgetSlots,
    ],
  )

  const layoutValue = useMemo(
    () => ({
      sidebarExpanded: session.sidebarExpanded,
    }),
    [session.sidebarExpanded],
  )

  const routeTransitionValue = useMemo(
    () => ({
      routeTransitionActive: routeTransition.active,
      routeTransitionLabel: routeTransition.label,
      routeTransitionMode: routeTransition.mode,
      routeTransitionStartedAt: routeTransition.startedAt,
      routeTransitionTargetPath: routeTransition.targetPath,
      routeTransitionTitle: routeTransition.title,
    }),
    [routeTransition],
  )

  const actionsValue = useMemo(
    () => ({
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
      resetOverviewMetricSlots,
      resetOverviewWidgetSlots,
      startRouteTransition,
      toggleSidebar,
    }),
    [
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
      resetOverviewMetricSlots,
      resetOverviewWidgetSlots,
      startRouteTransition,
      toggleSidebar,
    ],
  )

  return (
    <DashboardAuthContext.Provider value={authValue}>
      <DashboardDatasetContext.Provider value={datasetValue}>
        <DashboardSelectionContext.Provider value={selectionValue}>
          <DashboardPreferencesContext.Provider value={preferencesValue}>
            <DashboardLayoutContext.Provider value={layoutValue}>
              <DashboardRouteTransitionContext.Provider value={routeTransitionValue}>
                <DashboardActionsContext.Provider value={actionsValue}>
                  {children}
                </DashboardActionsContext.Provider>
              </DashboardRouteTransitionContext.Provider>
            </DashboardLayoutContext.Provider>
          </DashboardPreferencesContext.Provider>
        </DashboardSelectionContext.Provider>
      </DashboardDatasetContext.Provider>
    </DashboardAuthContext.Provider>
  )
}

export function useDashboardAuth() {
  return useRequiredContext(DashboardAuthContext, 'useDashboardAuth')
}

export function useDashboardDataset() {
  return useRequiredContext(DashboardDatasetContext, 'useDashboardDataset')
}

export function useDashboardSelection() {
  return useRequiredContext(DashboardSelectionContext, 'useDashboardSelection')
}

export function useDashboardPreferences() {
  return useRequiredContext(DashboardPreferencesContext, 'useDashboardPreferences')
}

export function useDashboardLayoutState() {
  return useRequiredContext(DashboardLayoutContext, 'useDashboardLayoutState')
}

export function useDashboardRouteTransition() {
  return useRequiredContext(
    DashboardRouteTransitionContext,
    'useDashboardRouteTransition',
  )
}

export function useDashboardActions() {
  return useRequiredContext(DashboardActionsContext, 'useDashboardActions')
}

export function useDashboard() {
  return {
    ...useDashboardAuth(),
    ...useDashboardDataset(),
    ...useDashboardSelection(),
    ...useDashboardPreferences(),
    ...useDashboardLayoutState(),
    ...useDashboardRouteTransition(),
    ...useDashboardActions(),
  }
}
