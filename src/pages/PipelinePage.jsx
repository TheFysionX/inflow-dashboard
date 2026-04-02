import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Funnel,
  FunnelChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AnimatedPage from '../components/ui/AnimatedPage'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import ChartPanel from '../components/ui/ChartPanel'
import FilterChips from '../components/ui/FilterChips'
import StageBadge from '../components/ui/StageBadge'
import StatusPill from '../components/ui/StatusPill'
import { useDashboard } from '../context/AppContext'
import { getPipelineModel } from '../data/selectors'

const funnelColors = ['#876dff', '#7c87ff', '#73a1ff', '#b993ff', '#f49be3']

function getFunnelStageShare(value, baseline) {
  if (!baseline) {
    return 0
  }

  return Math.max(0, Math.min(100, (value / baseline) * 100))
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  const title = payload[0]?.payload?.label ?? label

  return (
    <div className="chart-tooltip">
      <strong>{title}</strong>
      {payload.map((entry) => (
        <div className="chart-tooltip-row" key={`${entry.name}-${entry.value}`}>
          <span>{entry.name}</span>
          <strong>
            {typeof entry.value === 'number'
              ? `${Math.round(entry.value * 10) / 10}${entry.name === 'Days' ? 'd' : entry.name === 'Rate' ? '%' : ''}`
              : entry.value}
          </strong>
        </div>
      ))}
    </div>
  )
}

function StageDistribution({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="stage-distribution">
      {items.map((item) => (
        <div className="stage-distribution-row" key={item.key}>
          <div className="stage-distribution-meta">
            <StageBadge tone={item.tone}>{item.label}</StageBadge>
            <strong>{item.value}</strong>
          </div>
          <div className="stage-distribution-track">
            <div
              className="stage-distribution-fill"
              style={{
                '--distribution-width': `${item.share}%`,
                '--distribution-color': item.color,
              }}
            />
          </div>
          <small>{total ? `${Math.round(item.share)}% of filtered leads` : 'No leads in view'}</small>
        </div>
      ))}
    </div>
  )
}

function JourneyFunnel({ items, activeIndex, onActiveChange, rangeKey }) {
  const openingValue = items[0]?.value ?? 0

  return (
    <div className="pipeline-funnel-shell">
      <div className="pipeline-funnel-chart">
        <ResponsiveContainer height="100%" width="100%">
          <FunnelChart>
            <defs>
              <filter id={`funnelGlow-pipeline-${rangeKey}`}>
                <feDropShadow
                  dx="0"
                  dy="0"
                  floodColor="rgba(244, 155, 227, 0.46)"
                  stdDeviation="10"
                />
              </filter>
            </defs>
            <Tooltip content={<ChartTooltip />} />
            <Funnel
              animationDuration={940}
              data={items}
              dataKey="value"
              isAnimationActive
              nameKey="label"
              onMouseLeave={() => onActiveChange(null)}
              stroke="rgba(255,255,255,0.1)"
            >
              {items.map((item, index) => (
                <Cell
                  cursor="pointer"
                  fill={funnelColors[index] ?? funnelColors.at(-1)}
                  fillOpacity={activeIndex === null || index === activeIndex ? 1 : 0.44}
                  filter={index === activeIndex ? `url(#funnelGlow-pipeline-${rangeKey})` : undefined}
                  key={item.key}
                  onMouseEnter={() => onActiveChange(index)}
                  stroke={index === activeIndex ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.08)'}
                  strokeWidth={index === activeIndex ? 2 : 1}
                />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>

      <div className="funnel-key-shell">
        <div
          className={`funnel-key-stack ${activeIndex !== null ? 'has-active-stage' : ''}`}
          key={`pipeline-funnel-key-${rangeKey}`}
        >
          <div
            aria-hidden="true"
            className={`funnel-key-baseline ${activeIndex !== null ? 'is-visible' : ''}`}
          />
          {items.map((item, index) => {
            const width = getFunnelStageShare(item.value, openingValue)
            const isActive = index === activeIndex
            const showInlineLabel = isActive && width >= 20

            return (
              <button
                className={`funnel-key-layer ${
                  isActive ? 'is-active' : ''
                } ${
                  index === 0 ? 'is-opening' : ''
                } ${
                  activeIndex !== null && !isActive ? 'is-muted' : ''
                }`}
                key={item.key}
                onMouseEnter={() => onActiveChange(index)}
                onMouseLeave={() => onActiveChange(null)}
                style={{
                  '--funnel-layer-color': funnelColors[index] ?? funnelColors.at(-1),
                  '--funnel-layer-delay': `${0.16 + (index * 0.08)}s`,
                  '--funnel-layer-width': `${width}%`,
                  zIndex: isActive ? 12 : index + 1,
                }}
                type="button"
              >
                {showInlineLabel ? (
                  <span className="funnel-key-layer-label">
                    {item.label}
                    <strong>{item.value}</strong>
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CompletionCards({ items }) {
  return (
    <div className="completion-card-grid">
      {items.map((item) => (
        <article className="completion-card" key={item.key}>
          <div
            className="completion-card-ring"
            style={{
              '--completion-color': item.color,
              '--completion-rate': `${Math.max(0, Math.min(100, item.value))}%`,
            }}
          >
            <strong>{Math.round(item.value)}%</strong>
          </div>
          <div className="completion-card-copy">
            <span>{item.label}</span>
            <div>
              <strong>{item.count}</strong>
              <small>advanced</small>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function buildPipelineSummary(rows) {
  const qualified = rows.filter((row) => row.qualificationKey === 'qualified').length
  const needsAttention = rows.filter((row) => row.statusLabel === 'Needs attention').length
  const confirmed = rows.filter((row) => row.bookingStatusLabel === 'Confirmed').length

  return [
    {
      key: 'pipeline-leads',
      label: 'Pipeline Leads',
      value: rows.length,
      detail: 'Leads visible after the current filters',
    },
    {
      key: 'qualified-leads',
      label: 'Qualified Leads',
      value: qualified,
      detail: rows.length ? `${Math.round((qualified / rows.length) * 100)}% of visible pipeline` : 'No visible leads',
    },
    {
      key: 'needs-attention',
      label: 'Needs Attention',
      value: needsAttention,
      detail: 'Threads that need a follow-up right now',
    },
    {
      key: 'confirmed-calls',
      label: 'Confirmed Calls',
      value: confirmed,
      detail: 'Calls already scheduled in this filtered set',
    },
  ]
}

function buildFilteredStageDistribution(rows) {
  const total = rows.length || 1

  return ['opening', 'current', 'desired', 'objection', 'book'].map((stageKey) => {
    const stageRows = rows.filter((row) => row.stageKey === stageKey)
    const sample = stageRows[0]

    return {
      key: stageKey,
      label: sample?.stageLabel ?? stageKey,
      value: stageRows.length,
      share: (stageRows.length / total) * 100,
      color: sample?.stageColor ?? '#89b8ff',
      tone: sample?.stageTone ?? 'neutral',
    }
  })
}

function buildFilteredResponseGap(rows) {
  return ['opening', 'current', 'desired', 'objection', 'book'].map((stageKey) => {
    const stageRows = rows.filter((row) => row.stageKey === stageKey)
    const sample = stageRows[0]
    const totalMinutes = stageRows.reduce((sum, row) => sum + row.avgReplyLatencyMinutes, 0)

    return {
      key: stageKey,
      label: sample?.stageLabel ?? stageKey,
      value: stageRows.length ? totalMinutes / stageRows.length / (24 * 60) : 0,
      color: sample?.stageColor ?? '#89b8ff',
    }
  })
}

export default function PipelinePage() {
  const { dataset, activeClientId, rangeSelection } = useDashboard()
  const [currentFilters, setCurrentFilters] = useState({
    stage: 'all',
    qualification: 'all',
    objection: 'all',
    bookingStatus: 'all',
  })
  const [activeFunnelIndex, setActiveFunnelIndex] = useState(null)

  const pipeline = useMemo(
    () => getPipelineModel(dataset, activeClientId, rangeSelection),
    [activeClientId, dataset, rangeSelection],
  )

  const filteredRows = useMemo(
    () =>
      pipeline.rows.filter((row) => {
        if (currentFilters.stage !== 'all' && row.stageKey !== currentFilters.stage) {
          return false
        }

        if (
          currentFilters.qualification !== 'all' &&
          row.qualificationKey !== currentFilters.qualification
        ) {
          return false
        }

        if (currentFilters.objection !== 'all' && row.objectionKey !== currentFilters.objection) {
          return false
        }

        if (
          currentFilters.bookingStatus !== 'all' &&
          row.bookingStatusLabel !== currentFilters.bookingStatus
        ) {
          return false
        }

        return true
      }),
    [currentFilters.bookingStatus, currentFilters.objection, currentFilters.qualification, currentFilters.stage, pipeline.rows],
  )

  const summaryCards = useMemo(
    () => buildPipelineSummary(filteredRows),
    [filteredRows],
  )

  const stageDistribution = useMemo(
    () => buildFilteredStageDistribution(filteredRows),
    [filteredRows],
  )

  const responseGapByStage = useMemo(
    () => buildFilteredResponseGap(filteredRows),
    [filteredRows],
  )

  const completionSteps = useMemo(
    () =>
      pipeline.completionRate.map((item, index) => ({
        ...item,
        count: pipeline.stageMovement.links[index]?.value ?? 0,
      })),
    [pipeline.completionRate, pipeline.stageMovement.links],
  )

  return (
    <AnimatedPage className="page-stack">
      <section className="surface-card filter-toolbar-panel filter-toolbar-panel--bare filter-toolbar-panel--spacious pipeline-filter-toolbar-panel">
        <div className="filter-toolbar filter-toolbar--inline">
          <FilterChips
            allLabel="All stages"
            label="Stage"
            onChange={(value) => setCurrentFilters((current) => ({ ...current, stage: value }))}
            options={pipeline.filterOptions.stages}
            value={currentFilters.stage}
          />
          <FilterChips
            allLabel="All qualification"
            label="Qualification"
            onChange={(value) =>
              setCurrentFilters((current) => ({ ...current, qualification: value }))
            }
            options={pipeline.filterOptions.qualifications}
            value={currentFilters.qualification}
          />
          <FilterChips
            allLabel="All objections"
            label="Objection"
            onChange={(value) =>
              setCurrentFilters((current) => ({ ...current, objection: value }))
            }
            options={pipeline.filterOptions.objections}
            value={currentFilters.objection}
          />
          <FilterChips
            allLabel="All booking"
            label="Booking"
            onChange={(value) =>
              setCurrentFilters((current) => ({ ...current, bookingStatus: value }))
            }
            options={pipeline.filterOptions.bookingStatuses}
            value={currentFilters.bookingStatus}
          />
        </div>
      </section>

      <section className="summary-card-grid">
        {summaryCards.map((card) => (
          <article className="surface-card summary-card" key={card.key}>
            <p className="sidebar-caption">{card.label}</p>
            <strong className="summary-card-value">
              <AnimatedNumber compact={false} value={card.value} />
            </strong>
            <p className="summary-card-detail">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="overview-grid overview-grid--dynamic overview-grid--equal-height">
        <ChartPanel
          badge={pipeline.rangeLabel}
          className="overview-widget overview-widget--wide"
          subtitle="Where visible leads are currently sitting"
          title="Stage distribution"
        >
          <StageDistribution items={stageDistribution} />
        </ChartPanel>

        <ChartPanel
          badge={pipeline.rangeLabel}
          className="overview-widget overview-widget--wide overview-panel overview-panel--funnel"
          subtitle="Pipeline progression"
          title="Lead journey funnel"
        >
          <JourneyFunnel
            activeIndex={activeFunnelIndex}
            items={pipeline.stageMovement.nodes}
            onActiveChange={setActiveFunnelIndex}
            rangeKey={pipeline.rangeKey}
          />
        </ChartPanel>
      </section>

      <section className="overview-grid overview-grid--dynamic">
        <ChartPanel
          badge={pipeline.rangeLabel}
          className="overview-widget overview-widget--wide pipeline-chart-panel"
          subtitle="Average latency before the next touch"
          title="Response gap by stage"
        >
          <ResponsiveContainer height={300} width="100%">
            <BarChart
              data={responseGapByStage}
              margin={{ top: 8, right: 12, left: -12, bottom: 8 }}
            >
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(value) => `${value.toFixed(1)}d`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Days" radius={[12, 12, 4, 4]}>
                {responseGapByStage.map((entry) => (
                  <Cell fill={entry.color} key={entry.key} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          badge={pipeline.rangeLabel}
          className="overview-widget overview-widget--wide pipeline-chart-panel"
          subtitle="Step-by-step advancement"
          title="Stage completion path"
        >
          <CompletionCards items={completionSteps} />
        </ChartPanel>
      </section>

      <section className="summary-card-grid summary-card-grid--signals">
        {pipeline.alerts.map((item) => (
          <article className="surface-card summary-card summary-card--compact" key={item.key}>
            <div className="summary-card-header">
              <p className="sidebar-caption">{item.label}</p>
              <StatusPill tone={item.tone}>{item.value}</StatusPill>
            </div>
            <p className="summary-card-detail">{item.detail}</p>
          </article>
        ))}
      </section>
    </AnimatedPage>
  )
}
