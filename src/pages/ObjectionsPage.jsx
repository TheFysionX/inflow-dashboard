import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AnimatedPage from '../components/ui/AnimatedPage'
import ChartPanel from '../components/ui/ChartPanel'
import EmptyState from '../components/ui/EmptyState'
import KpiCard from '../components/ui/KpiCard'
import LeadDetailDrawer from '../components/ui/LeadDetailDrawer'
import StatusPill from '../components/ui/StatusPill'
import TraceLineChart from '../components/ui/TraceLineChart'
import { useDashboard } from '../context/AppContext'
import { getLeadDetailModel, getObjectionsModel } from '../data/selectors'

const EMPTY_OBJECTIONS_MODEL = {
  summaryCards: [],
  distribution: [],
  trendSeries: [],
  dropOffByStage: [],
  recoveryByType: [],
  topBlocker: {
    label: 'Top blocker',
    value: 'No blocker data',
    detail: 'No objection data is available for this window yet.',
    tone: 'info',
  },
  expensiveBlocker: {
    label: 'Most expensive blocker',
    value: 'No blocker data',
    detail: 'No blocker cost is available for this window yet.',
    tone: 'info',
  },
  recoveredExamples: [],
  rangeLabel: 'No range',
  rangeKey: 'objections-empty',
}

function StandardTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="chart-tooltip">
      <strong>{payload[0]?.payload?.name ?? payload[0]?.payload?.label ?? label}</strong>
      {payload.map((entry) => (
        <div className="chart-tooltip-row" key={`${entry.name}-${entry.value}`}>
          <span>{entry.name}</span>
          <strong>
            {typeof entry.value === 'number'
              ? `${Math.round(entry.value * 10) / 10}${entry.name?.includes('Recovery') ? '%' : ''}`
              : entry.value}
          </strong>
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

function MixLegend({ items }) {
  return (
    <div className="mix-legend">
      {items.map((item) => (
        <div className="mix-legend-item" key={item.key}>
          <span className="mix-legend-swatch" style={{ '--mix-color': item.color }} />
          <span>{item.name}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function ObjectionsPage() {
  const { dataset, activeClientId, rangeSelection } = useDashboard()
  const [activeDistributionIndex, setActiveDistributionIndex] = useState(null)
  const [selectedLeadId, setSelectedLeadId] = useState('')

  const objections = useMemo(() => {
    try {
      return getObjectionsModel(dataset, activeClientId, rangeSelection)
    } catch (error) {
      console.error('Failed to build objections model', error)
      return EMPTY_OBJECTIONS_MODEL
    }
  }, [activeClientId, dataset, rangeSelection])

  const detail = useMemo(
    () => getLeadDetailModel(dataset, activeClientId, selectedLeadId),
    [activeClientId, dataset, selectedLeadId],
  )

  return (
    <AnimatedPage className="page-stack">
      <section className="kpi-grid search-jump-target" id="objections-summary">
        {objections.summaryCards.map((card, index) => (
          <KpiCard
            detail={card.detail}
            delta={card.delta}
            index={index}
            key={card.key}
            label={card.label}
            valueMeta={card.valueMeta}
          />
        ))}
      </section>

      <section className="overview-grid overview-grid--dynamic overview-grid--equal-height">
        <ChartPanel
          badge={objections.rangeLabel}
          className="overview-widget overview-widget--wide"
          index={0}
          sectionId="objections-trend"
          style={{ '--overview-span': 8 }}
          subtitle="Explicit blocker volume across the selected range"
          title="Objection trend over time"
        >
          <TraceLineChart
            color="var(--accent-pink)"
            data={objections.trendSeries}
            height={290}
            lineKey={`objection-trend-${objections.rangeKey}`}
            yTickCount={5}
          />
        </ChartPanel>

        <ChartPanel
          badge={objections.rangeLabel}
          className="overview-widget overview-widget--compact conversations-pie-panel objections-pie-panel"
          index={1}
          sectionId="objections-distribution"
          style={{ '--overview-span': 4 }}
          subtitle="Which blockers show up most often"
          title="Objection distribution"
        >
          {objections.distribution.length ? (
            <>
              <div className="objections-pie-figure">
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeDistributionIndex ?? undefined}
                      activeShape={ActivePieShape}
                      cx="50%"
                      cy="50%"
                      data={objections.distribution}
                      dataKey="value"
                      innerRadius="49%"
                      onMouseEnter={(_, index) => setActiveDistributionIndex(index)}
                      onMouseLeave={() => setActiveDistributionIndex(null)}
                      outerRadius="90%"
                      paddingAngle={4}
                    >
                      {objections.distribution.map((entry, index) => (
                        <Cell
                          fill={entry.color}
                          fillOpacity={
                            activeDistributionIndex === null || activeDistributionIndex === index ? 1 : 0.42
                          }
                          key={entry.key}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<StandardTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <MixLegend items={objections.distribution} />
            </>
          ) : (
            <EmptyState
              copy="No explicit blockers were logged in the current window."
              title="No objection data"
            />
          )}
        </ChartPanel>
      </section>

      <section className="overview-grid overview-grid--dynamic overview-grid--equal-height">
        <ChartPanel
          badge={objections.rangeLabel}
          className="overview-widget overview-widget--wide"
          index={0}
          sectionId="objections-dropoff"
          style={{ '--overview-span': 6 }}
          subtitle="Where conversations slow down after resistance appears"
          title="Drop-off by stage"
        >
          {objections.dropOffByStage.length ? (
            <ResponsiveContainer height={300} width="100%">
              <BarChart
                data={objections.dropOffByStage}
                margin={{ top: 8, right: 12, left: -16, bottom: 8 }}
              >
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip content={<StandardTooltip />} />
                <Bar dataKey="value" name="Leads" radius={[12, 12, 4, 4]}>
                  {objections.dropOffByStage.map((entry) => (
                    <Cell fill={entry.color} key={entry.key} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              copy="No drop-off concentration shows up in the visible window."
              title="No drop-off spikes"
            />
          )}
        </ChartPanel>

        <ChartPanel
          badge={objections.rangeLabel}
          className="overview-widget overview-widget--wide"
          index={1}
          sectionId="objections-recovery"
          style={{ '--overview-span': 6 }}
          subtitle="Which blockers still convert into scheduling"
          title="Objection-to-booking recovery"
        >
          {objections.recoveryByType.length ? (
            <ResponsiveContainer height={300} width="100%">
              <BarChart
                data={objections.recoveryByType}
                margin={{ top: 8, right: 12, left: -16, bottom: 8 }}
              >
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${Math.round(value)}%`} />
                <Tooltip content={<StandardTooltip />} />
                <Bar dataKey="value" name="Recovery %" radius={[12, 12, 4, 4]}>
                  {objections.recoveryByType.map((entry) => (
                    <Cell fill={entry.color} key={entry.key} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              copy="No objection leads recovered into scheduling in this view yet."
              title="No recovery signal"
            />
          )}
        </ChartPanel>
      </section>

      <section className="overview-grid overview-grid--dynamic">
        <ChartPanel
          badge={objections.rangeLabel}
          className="overview-widget overview-widget--compact"
          index={0}
          sectionId="objections-top-blocker"
          style={{ '--overview-span': 4 }}
          subtitle="Main blocker in this window"
          title="Top blocker"
        >
          <article className="issue-card">
            <div className="issue-card-header">
              <p>{objections.topBlocker.value}</p>
              <StatusPill tone={objections.topBlocker.tone}>{objections.topBlocker.label}</StatusPill>
            </div>
            <div className="issue-card-footer">
              <span>{objections.topBlocker.detail}</span>
              <small>{objections.rangeLabel}</small>
            </div>
          </article>
        </ChartPanel>

        <ChartPanel
          badge={objections.rangeLabel}
          className="overview-widget overview-widget--compact"
          index={1}
          sectionId="objections-expensive"
          style={{ '--overview-span': 4 }}
          subtitle="Where blocker value concentrates"
          title="Most expensive blocker"
        >
          <article className="issue-card">
            <div className="issue-card-header">
              <p>{objections.expensiveBlocker.value}</p>
              <StatusPill tone={objections.expensiveBlocker.tone}>
                {objections.expensiveBlocker.label}
              </StatusPill>
            </div>
            <div className="issue-card-footer">
              <span>{objections.expensiveBlocker.detail}</span>
              <small>Opportunity cost</small>
            </div>
          </article>
        </ChartPanel>

        <ChartPanel
          badge={objections.rangeLabel}
          className="overview-widget overview-widget--compact"
          index={2}
          sectionId="objections-recovered"
          style={{ '--overview-span': 4 }}
          subtitle="Recovered blocker examples"
          title="Recovered objections"
        >
          <div className="issue-stack list-stack--scrollable">
            {objections.recoveredExamples.length ? (
              objections.recoveredExamples.map((item) => (
                <button
                  className="issue-card issue-card--clickable"
                  key={item.id}
                  onClick={() => setSelectedLeadId(item.leadId)}
                  type="button"
                >
                  <div className="issue-card-header">
                    <p>{item.displayName}</p>
                    <StatusPill tone={item.statusTone}>{item.recoveredLabel}</StatusPill>
                  </div>
                  <div className="issue-card-footer">
                    <span>
                      {item.objectionLabel}
                      {' -> '}
                      {item.note}
                    </span>
                    <small>Open lead</small>
                  </div>
                </button>
              ))
            ) : (
              <EmptyState
                copy="No recovered objection examples were found in the current range."
                title="No recovery stories"
              />
            )}
          </div>
        </ChartPanel>
      </section>

      <LeadDetailDrawer
        lead={detail}
        onClose={() => setSelectedLeadId('')}
        open={Boolean(selectedLeadId)}
      />
    </AnimatedPage>
  )
}
