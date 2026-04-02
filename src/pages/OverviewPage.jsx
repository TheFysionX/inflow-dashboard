import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AnimatedPage from '../components/ui/AnimatedPage'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import ChartPanel from '../components/ui/ChartPanel'
import EmptyState from '../components/ui/EmptyState'
import KpiCard from '../components/ui/KpiCard'
import OptionSelect from '../components/ui/OptionSelect'
import StatusPill from '../components/ui/StatusPill'
import DualTraceLineChart from '../components/ui/DualTraceLineChart'
import { SettingsIcon } from '../components/ui/Icons'
import {
  buildOverviewWidgetLayout,
  getOverviewWidgetConfig,
  getWidgetOptionState,
} from '../config/overviewLayout'
import { useDashboard } from '../context/AppContext'
import { getOverviewModel } from '../data/selectors'

function StandardTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  const title = payload[0]?.payload?.stage ?? label ?? payload[0]?.name

  return (
    <div className="chart-tooltip">
      <strong>{title}</strong>
      {payload.map((entry) => (
        <div className="chart-tooltip-row" key={`${entry.name}-${entry.value}`}>
          <span>{entry.name}</span>
          <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
  )
}

function ActivePieShape(props) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props

  return (
    <motion.g
      animate={{ scale: 1.055 }}
      initial={{ scale: 0.985 }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
    >
      <Sector
        cx={cx}
        cy={cy}
        endAngle={endAngle}
        fill={fill}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
      />
      <Sector
        cx={cx}
        cy={cy}
        endAngle={endAngle}
        fill={fill}
        fillOpacity={0.16}
        innerRadius={outerRadius + 14}
        outerRadius={outerRadius + 24}
        startAngle={startAngle}
      />
    </motion.g>
  )
}

const funnelColors = ['#876dff', '#7c87ff', '#73a1ff', '#b993ff', '#f49be3']
const DEFAULT_TREND_SERIES = {
  leadTrend: ['total_new_leads'],
  bookingTrend: ['confirmed_calls'],
}

function getFunnelStageShare(value, baseline) {
  if (!baseline) {
    return 0
  }

  return Math.max(0, Math.min(100, (value / baseline) * 100))
}

function normalizeTrendSelection(selectedKeys, catalog, fallbackKeys) {
  const validKeys = (selectedKeys ?? []).filter((key) => catalog.some((item) => item.key === key))

  if (validKeys.length) {
    return validKeys
  }

  return fallbackKeys.filter((key) => catalog.some((item) => item.key === key))
}

function buildTrendChartData(catalog, selectedKeys) {
  const selectedSeries = catalog.filter((item) => selectedKeys.includes(item.key))

  if (!selectedSeries.length) {
    return { data: [], series: [] }
  }

  return {
    data: selectedSeries[0].data.map((point, index) => ({
      label: point.label,
      ...Object.fromEntries(
        selectedSeries.map((series) => [series.key, series.data[index]?.value ?? 0]),
      ),
    })),
    series: selectedSeries.map((series) => ({
      key: series.key,
      label: series.label,
      color: series.color,
    })),
  }
}

function TrendSettingsPanel({
  title,
  options,
  selectedKeys,
  onToggle,
  onReset,
}) {
  return (
    <div className="chart-settings-shell">
      <div className="chart-settings-copy">
        <p className="sidebar-caption">Graph settings</p>
        <h4>{title}</h4>
        <p>Select one or more values to compare in this chart.</p>
      </div>

      <div className="chart-settings-options">
        {options.map((option) => {
          const active = selectedKeys.includes(option.key)

          return (
            <button
              className={`chart-settings-option ${active ? 'is-active' : ''}`}
              key={option.key}
              onClick={() => onToggle(option.key)}
              type="button"
            >
              <span className="chart-settings-option-dot" style={{ '--chart-option-color': option.color }} />
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>

      <div className="chart-settings-actions">
        <button className="ghost-button button-small" onClick={onReset} type="button">
          Reset to default
        </button>
      </div>
    </div>
  )
}

export default function OverviewPage() {
  const navigate = useNavigate()
  const {
    dataset,
    activeClientId,
    rangeSelection,
    overviewMetricSlots,
    overviewCustomizerOpen,
    overviewUseCompactNumbers,
    overviewWidgetSlots,
    resetOverviewMetricSlots,
    resetOverviewWidgetSlots,
    setOverviewCustomizerOpen,
    setOverviewMetricSlot,
    setOverviewUseCompactNumbers,
    setOverviewWidgetSlot,
  } = useDashboard()
  const [activePieIndex, setActivePieIndex] = useState(null)
  const [activeFunnelIndex, setActiveFunnelIndex] = useState(null)
  const [trendSettingsOpen, setTrendSettingsOpen] = useState({
    leadTrend: false,
    bookingTrend: false,
  })
  const [trendSelections, setTrendSelections] = useState(DEFAULT_TREND_SERIES)

  const overview = useMemo(
    () =>
      getOverviewModel(dataset, activeClientId, rangeSelection, overviewMetricSlots),
    [activeClientId, dataset, overviewMetricSlots, rangeSelection],
  )
  const metricOptions = useMemo(
    () =>
      overview.availableMetrics.map((metric) => ({
        label: metric.label,
        value: metric.key,
      })),
    [overview.availableMetrics],
  )
  const widgetOptions = useMemo(
    () =>
      overviewWidgetSlots.map((_, index) =>
        getWidgetOptionState(overviewWidgetSlots, index)),
    [overviewWidgetSlots],
  )
  const widgetLayout = useMemo(
    () => buildOverviewWidgetLayout(overviewWidgetSlots),
    [overviewWidgetSlots],
  )
  const primaryWidgetLayout = useMemo(
    () => {
      const preferred = widgetLayout.filter((item) =>
        ['leadTrend', 'bookingTrend'].includes(item.key),
      )

      if (preferred.length) {
        return preferred
      }

      return widgetLayout.filter((item) => item.key !== 'qualificationBreakdown').slice(0, 2)
    },
    [widgetLayout],
  )
  const secondaryWidgetLayout = useMemo(
    () => widgetLayout.filter((item) => !['leadTrend', 'bookingTrend'].includes(item.key)),
    [widgetLayout],
  )
  const leadTrendSelection = useMemo(
    () =>
      normalizeTrendSelection(
        trendSelections.leadTrend,
        overview.leadTrendCatalog ?? [],
        DEFAULT_TREND_SERIES.leadTrend,
      ),
    [overview.leadTrendCatalog, trendSelections.leadTrend],
  )
  const bookingTrendSelection = useMemo(
    () =>
      normalizeTrendSelection(
        trendSelections.bookingTrend,
        overview.bookingTrendCatalog ?? [],
        DEFAULT_TREND_SERIES.bookingTrend,
      ),
    [overview.bookingTrendCatalog, trendSelections.bookingTrend],
  )
  const leadTrendChart = useMemo(
    () => buildTrendChartData(overview.leadTrendCatalog ?? [], leadTrendSelection),
    [leadTrendSelection, overview.leadTrendCatalog],
  )
  const bookingTrendChart = useMemo(
    () => buildTrendChartData(overview.bookingTrendCatalog ?? [], bookingTrendSelection),
    [bookingTrendSelection, overview.bookingTrendCatalog],
  )

  function toggleTrendSetting(widgetKey) {
    setTrendSettingsOpen((current) => ({
      ...current,
      [widgetKey]: !current[widgetKey],
    }))
  }

  function toggleTrendSeries(widgetKey, metricKey) {
    setTrendSelections((current) => {
      const activeKeys = current[widgetKey] ?? DEFAULT_TREND_SERIES[widgetKey] ?? []
      const nextKeys = activeKeys.includes(metricKey)
        ? activeKeys.filter((key) => key !== metricKey)
        : [...activeKeys, metricKey]

      return {
        ...current,
        [widgetKey]: nextKeys.length ? nextKeys : activeKeys,
      }
    })
  }

  function resetTrendSeries(widgetKey) {
    setTrendSelections((current) => ({
      ...current,
      [widgetKey]: [...(DEFAULT_TREND_SERIES[widgetKey] ?? [])],
    }))
  }

  function renderWidget(layoutItem, slotIndex) {
    const widgetKey = layoutItem.key
    const widgetClassName = getOverviewWidgetConfig(widgetKey).size
    const rangeLabel = overview.rangeLabel
    const rangeKey = overview.rangeKey
    const widgetStyle = { '--overview-span': layoutItem.span }

    if (widgetKey === 'funnel') {
      const activeFunnel =
        activeFunnelIndex === null ? null : overview.funnelSeries[activeFunnelIndex]
      const openingValue = overview.funnelSeries[0]?.value ?? 0

      return (
        <ChartPanel
          actionLabel="Open pipeline"
          badge={activeFunnel ? `${activeFunnel.stage} - ${activeFunnel.value}` : rangeLabel}
          className={`overview-panel overview-panel--funnel overview-widget ${widgetClassName}`}
          index={slotIndex}
          key={`widget-${slotIndex}-${widgetKey}-${rangeKey}`}
          onAction={() => navigate('/pipeline')}
          style={widgetStyle}
          subtitle="Pipeline progression"
          title="Lead journey funnel"
        >
          <ResponsiveContainer height={284} width="100%">
            <FunnelChart>
              <defs>
                <filter id={`funnelGlow-${rangeKey}`}>
                  <feDropShadow
                    dx="0"
                    dy="0"
                    floodColor="rgba(244, 155, 227, 0.46)"
                    stdDeviation="10"
                  />
                </filter>
              </defs>
              <Tooltip content={<StandardTooltip />} />
              <Funnel
                animationDuration={940}
                data={overview.funnelSeries}
                dataKey="value"
                isAnimationActive
                key={`funnel-shape-${rangeKey}`}
                nameKey="stage"
                onMouseLeave={() => setActiveFunnelIndex(null)}
                stroke="rgba(255,255,255,0.08)"
              >
                {overview.funnelSeries.map((entry, funnelIndex) => (
                  <Cell
                    cursor="pointer"
                    fill={funnelColors[funnelIndex] ?? funnelColors.at(-1)}
                    fillOpacity={
                      activeFunnelIndex === null || funnelIndex === activeFunnelIndex ? 1 : 0.44
                    }
                    filter={
                      funnelIndex === activeFunnelIndex ? `url(#funnelGlow-${rangeKey})` : undefined
                    }
                    key={entry.stage}
                    onMouseEnter={() => setActiveFunnelIndex(funnelIndex)}
                    stroke={
                      funnelIndex === activeFunnelIndex
                        ? 'rgba(255,255,255,0.65)'
                        : 'rgba(255,255,255,0.08)'
                    }
                    strokeWidth={funnelIndex === activeFunnelIndex ? 2 : 1}
                  />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
          <div className="funnel-key-shell">
            <div
              key={`funnel-key-${rangeKey}`}
              className={`funnel-key-stack ${
                activeFunnelIndex !== null ? 'has-active-stage' : ''
              }`}
            >
              <div
                aria-hidden="true"
                className={`funnel-key-baseline ${
                  activeFunnelIndex !== null ? 'is-visible' : ''
                }`}
              />
              {overview.funnelSeries.map((item, funnelIndex) => {
                const width = getFunnelStageShare(item.value, openingValue)
                const isActive = funnelIndex === activeFunnelIndex
                const showInlineLabel = isActive && width >= 20

                return (
                  <button
                    className={`funnel-key-layer ${
                      isActive ? 'is-active' : ''
                    } ${
                      funnelIndex === 0 ? 'is-opening' : ''
                    } ${
                      activeFunnelIndex !== null && !isActive ? 'is-muted' : ''
                    }`}
                    key={item.stage}
                    onMouseEnter={() => setActiveFunnelIndex(funnelIndex)}
                    onMouseLeave={() => setActiveFunnelIndex(null)}
                    style={{
                      '--funnel-layer-color': funnelColors[funnelIndex] ?? funnelColors.at(-1),
                      '--funnel-layer-delay': `${0.16 + (funnelIndex * 0.08)}s`,
                      '--funnel-layer-width': `${width}%`,
                      zIndex: isActive ? 12 : funnelIndex + 1,
                    }}
                    type="button"
                  >
                    {showInlineLabel ? (
                      <span className="funnel-key-layer-label">
                        {item.stage}
                        <strong>{item.value}</strong>
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        </ChartPanel>
      )
    }

    if (widgetKey === 'leadTrend') {
      return (
        <ChartPanel
          actionLabel="Open leads"
          badge={rangeLabel}
          className={`overview-panel overview-widget ${widgetClassName}`}
          index={slotIndex}
          key={`widget-${slotIndex}-${widgetKey}-${rangeKey}`}
          onAction={() => navigate('/leads')}
          onToolAction={() => toggleTrendSetting('leadTrend')}
          style={widgetStyle}
          subtitle="New lead intake"
          toolIcon={<SettingsIcon size={16} />}
          toolLabel="Configure lead trend"
          title="Lead volume trend"
        >
          {trendSettingsOpen.leadTrend ? (
            <TrendSettingsPanel
              onReset={() => resetTrendSeries('leadTrend')}
              onToggle={(metricKey) => toggleTrendSeries('leadTrend', metricKey)}
              options={overview.leadTrendCatalog ?? []}
              selectedKeys={leadTrendSelection}
              title="Lead volume trend"
            />
          ) : (
            <DualTraceLineChart
              data={leadTrendChart.data}
              height={290}
              lineKey={`${rangeKey}-lead-${leadTrendSelection.join('-')}`}
              series={leadTrendChart.series}
              yTickCount={5}
            />
          )}
        </ChartPanel>
      )
    }

    if (widgetKey === 'bookingTrend') {
      return (
        <ChartPanel
          actionLabel="Open bookings"
          badge={rangeLabel}
          className={`overview-panel overview-widget ${widgetClassName}`}
          index={slotIndex}
          key={`widget-${slotIndex}-${widgetKey}-${rangeKey}`}
          onAction={() => navigate('/bookings')}
          onToolAction={() => toggleTrendSetting('bookingTrend')}
          style={widgetStyle}
          subtitle="Confirmed bookings"
          toolIcon={<SettingsIcon size={16} />}
          toolLabel="Configure booking trend"
          title="Booking trend"
        >
          {trendSettingsOpen.bookingTrend ? (
            <TrendSettingsPanel
              onReset={() => resetTrendSeries('bookingTrend')}
              onToggle={(metricKey) => toggleTrendSeries('bookingTrend', metricKey)}
              options={overview.bookingTrendCatalog ?? []}
              selectedKeys={bookingTrendSelection}
              title="Booking trend"
            />
          ) : (
            <DualTraceLineChart
              data={bookingTrendChart.data}
              height={290}
              lineKey={`${rangeKey}-booking-${bookingTrendSelection.join('-')}`}
              series={bookingTrendChart.series}
              yTickCount={5}
            />
          )}
        </ChartPanel>
      )
    }

    if (widgetKey === 'qualificationBreakdown') {
      const activeLabel =
        activePieIndex === null ? rangeLabel : overview.qualificationSeries[activePieIndex]?.name

      return (
        <ChartPanel
          badge={activeLabel}
          className={`overview-panel overview-widget ${widgetClassName}`}
          index={slotIndex}
          key={`widget-${slotIndex}-${widgetKey}-${rangeKey}`}
          style={widgetStyle}
          subtitle="Lead qualification"
          title="Qualification breakdown"
        >
          <ResponsiveContainer height={250} width="100%">
            <PieChart>
              <Pie
                activeIndex={activePieIndex ?? undefined}
                activeShape={ActivePieShape}
                animationDuration={900}
                cx="50%"
                cy="50%"
                data={overview.qualificationSeries}
                dataKey="value"
                innerRadius={58}
                isAnimationActive
                key={`qualification-shape-${rangeKey}`}
                onMouseEnter={(_, pieIndex) => setActivePieIndex(pieIndex)}
                onMouseLeave={() => setActivePieIndex(null)}
                outerRadius={86}
                paddingAngle={3}
              >
                {overview.qualificationSeries.map((entry, pieIndex) => (
                  <Cell
                    fill={entry.color}
                    fillOpacity={activePieIndex === null || pieIndex === activePieIndex ? 1 : 0.55}
                    key={entry.name}
                  />
                ))}
              </Pie>
              <Tooltip content={<StandardTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend-inline legend-inline--stack">
            {overview.qualificationSeries.map((item, pieIndex) => (
              <button
                className={
                  pieIndex === activePieIndex
                    ? 'legend-inline-item is-active'
                    : 'legend-inline-item'
                }
                key={item.name}
                onMouseEnter={() => setActivePieIndex(pieIndex)}
                onMouseLeave={() => setActivePieIndex(null)}
                type="button"
              >
                <span>{item.name}</span>
                <strong>{item.value}</strong>
              </button>
            ))}
          </div>
        </ChartPanel>
      )
    }

    if (widgetKey === 'objectionDistribution') {
      return (
        <ChartPanel
          actionLabel="Open objections"
          badge={rangeLabel}
          className={`overview-panel overview-widget ${widgetClassName}`}
          index={slotIndex}
          key={`widget-${slotIndex}-${widgetKey}-${rangeKey}`}
          onAction={() => navigate('/objections')}
          style={widgetStyle}
          subtitle="Resistance patterns"
          title="Objection distribution"
        >
          <ResponsiveContainer height={250} width="100%">
            <BarChart
              data={overview.objectionSeries}
              layout="vertical"
              margin={{ top: 8, right: 28, left: 8, bottom: 8 }}
            >
              <XAxis hide type="number" />
              <YAxis
                axisLine={false}
                dataKey="name"
                tickLine={false}
                type="category"
                width={84}
              />
              <Tooltip content={<StandardTooltip />} />
              <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                {overview.objectionSeries.map((entry) => (
                  <Cell fill={entry.color} key={entry.name} />
                ))}
                <LabelList
                  dataKey="value"
                  fill="rgba(247,247,251,0.78)"
                  position="right"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      )
    }

    if (widgetKey === 'needsAttention') {
      return (
        <ChartPanel
          actionLabel="Open pipeline"
          badge={
            <>
              <span className="live-badge-dot" />
              <span>Live</span>
            </>
          }
          className={`overview-panel overview-widget ${widgetClassName}`}
          index={slotIndex}
          key={`widget-${slotIndex}-${widgetKey}`}
          onAction={() => navigate('/pipeline')}
          style={widgetStyle}
          subtitle="Operational watchlist"
          title="Needs attention"
        >
          <div className="list-stack list-stack--scrollable">
            {overview.needsAttention.length ? (
              overview.needsAttention.map((item) => (
                <div className="list-row" key={`${item.leadName}-${item.stage}`}>
                  <div>
                    <strong>{item.leadName}</strong>
                    <p>
                      {item.stage} - {item.stageAge}
                    </p>
                  </div>
                  <div className="list-row-meta">
                    <StatusPill tone={item.status}>{item.note}</StatusPill>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                copy="No leads are currently breaching the stage age threshold."
                title="Everything looks healthy"
              />
            )}
          </div>
        </ChartPanel>
      )
    }

    if (widgetKey === 'upcomingCalls') {
      return (
        <ChartPanel
          actionLabel="Open bookings"
          badge="Next 14 days"
          className={`overview-panel overview-widget ${widgetClassName}`}
          index={slotIndex}
          key={`widget-${slotIndex}-${widgetKey}`}
          onAction={() => navigate('/bookings')}
          style={widgetStyle}
          subtitle="Scheduling"
          title="Upcoming calls"
        >
          <div className="list-stack list-stack--scrollable">
            {overview.upcomingCalls.length ? (
              overview.upcomingCalls.map((item) => (
                <div className="list-row" key={`${item.leadName}-${item.time}`}>
                  <div>
                    <strong>{item.leadName}</strong>
                    <p>{item.time}</p>
                  </div>
                  <div className="list-row-meta">
                    <StatusPill tone="positive">{item.relativeTime}</StatusPill>
                    <small>{item.timezone}</small>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                copy="No calls are scheduled in the next two weeks."
                title="Open calendar"
              />
            )}
          </div>
        </ChartPanel>
      )
    }

    return (
      <ChartPanel
        badge={rangeLabel}
        className={`overview-panel overview-widget ${widgetClassName}`}
        index={slotIndex}
        key={`widget-${slotIndex}-${widgetKey}-${rangeKey}`}
        style={widgetStyle}
        subtitle="What is hurting momentum"
        title="Top issues"
      >
        <div className="issue-stack">
          {overview.topIssues.map((issue) => (
            <button
              className="issue-card issue-card--clickable"
              key={issue.title}
              onClick={() => navigate(issue.routePath)}
              type="button"
            >
              <div className="issue-card-header">
                <p>{issue.title}</p>
                <StatusPill tone={issue.tone}>{issue.value}</StatusPill>
              </div>
              <div className="issue-card-footer">
                <span>{issue.note}</span>
                <small>{issue.routeLabel}</small>
              </div>
            </button>
          ))}
        </div>
      </ChartPanel>
    )
  }

  return (
    <AnimatedPage className="page-stack">
      <motion.section className="surface-card overview-toolbar" layout>
        <div className="overview-toolbar-copy">
          <p className="sidebar-caption">Overview layout</p>
          <h2>Choose the KPIs and graphs shown on this page.</h2>
        </div>

        <div className="overview-toolbar-actions">
          <button
            className="secondary-button button-small"
            onClick={() => setOverviewCustomizerOpen(!overviewCustomizerOpen)}
            type="button"
          >
            {overviewCustomizerOpen ? 'Hide overview controls' : 'Customize overview'}
          </button>
          <button
            aria-label={
              overviewUseCompactNumbers
                ? 'Switch to full number format'
                : 'Switch to compact number format'
            }
            aria-pressed={overviewUseCompactNumbers}
            className={`overview-display-toggle-button overview-display-toggle-button--toolbar ${
              overviewUseCompactNumbers ? 'is-compact' : 'is-full'
            }`}
            onClick={() => setOverviewUseCompactNumbers(!overviewUseCompactNumbers)}
            type="button"
          >
            <span>1K</span>
            <span>1,000</span>
          </button>
          {overviewCustomizerOpen ? (
            <>
              <button
                className="ghost-button button-small"
                onClick={resetOverviewMetricSlots}
                type="button"
              >
                Reset KPIs
              </button>
              <button
                className="ghost-button button-small"
                onClick={resetOverviewWidgetSlots}
                type="button"
              >
                Reset graphs
              </button>
            </>
          ) : null}
        </div>
      </motion.section>

      <AnimatePresence initial={false}>
        {overviewCustomizerOpen ? (
          <motion.section
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            className="surface-card overview-customizer"
            exit={{ height: 0, opacity: 0, y: -8 }}
            initial={{ height: 0, opacity: 0, y: -8 }}
            layout
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="overview-customizer-inner"
              exit={{ opacity: 0, y: -4 }}
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="overview-customizer-header">
                <div>
                  <p className="sidebar-caption">Overview controls</p>
                  <h3>Select which metrics and graphs the homepage shows</h3>
                </div>
              </div>

              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="overview-customizer-section"
                initial={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.24, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <h4>KPI slots</h4>
                <div className="overview-customizer-grid">
                  {overviewMetricSlots.map((metricKey, index) => (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="overview-customizer-field"
                      initial={{ opacity: 0, y: 10 }}
                      key={`metric-slot-${index}`}
                      transition={{
                        duration: 0.2,
                        delay: 0.08 + index * 0.03,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <span>Slot {index + 1}</span>
                      <OptionSelect
                        onChange={(nextValue) => setOverviewMetricSlot(index, nextValue)}
                        options={metricOptions}
                        value={metricKey}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="overview-customizer-section"
                initial={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.24, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <h4>Graph and widget slots</h4>
                <div className="overview-customizer-grid">
                  {overviewWidgetSlots.map((widgetKey, index) => (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="overview-customizer-field"
                      initial={{ opacity: 0, y: 10 }}
                      key={`widget-slot-${index}`}
                      transition={{
                        duration: 0.2,
                        delay: 0.12 + index * 0.03,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <span>Widget {index + 1}</span>
                      <OptionSelect
                        onChange={(nextValue) => setOverviewWidgetSlot(index, nextValue)}
                        options={widgetOptions[index]}
                        value={widgetKey}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <motion.section className="surface-card overview-summary" layout>
        <div className="overview-summary-copy">
          <p className="sidebar-caption">{overview.summary.title}</p>
          <StatusPill tone={overview.summary.primaryMetric.delta.tone}>
            {overview.summary.primaryMetric.delta.value}
          </StatusPill>
          <strong>
            <AnimatedNumber
              className={`summary-primary-number ${
                overview.summary.primaryMetric.label === 'Booked calls'
                  ? 'summary-primary-number--booked'
                  : `summary-primary-number--${overview.summary.primaryMetric.delta.tone}`
              }`}
              compact={overviewUseCompactNumbers}
              value={overview.summary.primaryMetric.numericValue}
            />
          </strong>
          <h2>{overview.summary.primaryMetric.label}</h2>
          <p>{overview.summary.primaryMetric.detail}</p>
        </div>

        <div className="overview-ticker">
          {overview.summary.tickers.map((ticker) => (
            <div className="overview-ticker-item" key={ticker.label}>
              <span>{ticker.label}</span>
              <StatusPill tone={ticker.tone}>{ticker.value}</StatusPill>
            </div>
          ))}
        </div>
      </motion.section>

      {primaryWidgetLayout.length ? (
        <motion.section className="overview-grid overview-grid--dynamic" layout>
          {primaryWidgetLayout.map((layoutItem, index) => renderWidget(layoutItem, index))}
        </motion.section>
      ) : null}

      <motion.section className="kpi-grid" layout>
        {overview.kpis.map((kpi, index) => (
          <KpiCard
            detail={kpi.detail}
            delta={kpi.delta}
            index={index}
            key={`${kpi.key}-${index}`}
            label={kpi.label}
            onClick={() => navigate(kpi.routePath)}
            useCompactNumbers={overviewUseCompactNumbers}
            valueMeta={kpi.valueMeta}
          />
        ))}
      </motion.section>

      {secondaryWidgetLayout.length ? (
        <motion.section className="overview-grid overview-grid--dynamic" layout>
          {secondaryWidgetLayout.map((layoutItem, index) =>
            renderWidget(layoutItem, primaryWidgetLayout.length + index),
          )}
        </motion.section>
      ) : null}
    </AnimatedPage>
  )
}
