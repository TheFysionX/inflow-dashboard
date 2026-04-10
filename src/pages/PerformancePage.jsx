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
import StageBadge from '../components/ui/StageBadge'
import StatusPill from '../components/ui/StatusPill'
import TraceLineChart from '../components/ui/TraceLineChart'
import {
  useDashboardDataset,
  useDashboardPreferences,
  useDashboardSelection,
} from '../context/AppContext'
import { getLeadDetailModel, getPerformanceModel } from '../data/selectors'

const integerFormatter = new Intl.NumberFormat('en-US')

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
              ? `${Math.round(entry.value * 10) / 10}${entry.name?.includes('%') ? '%' : ''}`
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

export default function PerformancePage() {
  const { dataset } = useDashboardDataset()
  const { activeClientId, rangeSelection } = useDashboardSelection()
  const { overviewUseCompactNumbers } = useDashboardPreferences()
  const [activeVerdictIndex, setActiveVerdictIndex] = useState(null)
  const [selectedLeadId, setSelectedLeadId] = useState('')

  const performance = useMemo(
    () => getPerformanceModel(dataset, activeClientId, rangeSelection),
    [activeClientId, dataset, rangeSelection],
  )

  const detail = useMemo(
    () => getLeadDetailModel(dataset, activeClientId, selectedLeadId),
    [activeClientId, dataset, selectedLeadId],
  )
  const pressureSummary = useMemo(() => {
    const totals = performance.reviewPressureSeries.reduce(
      (summary, item) => ({
        reviewed: summary.reviewed + Number(item.reviewed ?? 0),
        guardrail: summary.guardrail + Number(item.guardrail ?? 0),
      }),
      { reviewed: 0, guardrail: 0 },
    )

    const windows = performance.reviewPressureSeries
      .map((item) => {
        const reviewed = Number(item.reviewed ?? 0)
        const guardrail = Number(item.guardrail ?? 0)
        const touchRate = reviewed ? (guardrail / reviewed) * 100 : 0

        return {
          label: item.label,
          reviewed,
          guardrail,
          tone: touchRate >= 20 ? 'negative' : touchRate >= 10 ? 'warning' : 'positive',
          touchRate,
        }
      })
      .filter((item) => item.reviewed > 0 || item.guardrail > 0)
      .sort((left, right) => {
        if (right.touchRate !== left.touchRate) {
          return right.touchRate - left.touchRate
        }

        return right.reviewed - left.reviewed
      })
      .slice(0, 4)

    return {
      averageTouchRate: totals.reviewed ? (totals.guardrail / totals.reviewed) * 100 : 0,
      reviewed: totals.reviewed,
      guardrail: totals.guardrail,
      windows,
    }
  }, [performance.reviewPressureSeries])

  return (
    <AnimatedPage className="page-stack">
      <section className="kpi-grid search-jump-target" id="performance-summary">
        {performance.summaryCards.map((card, index) => (
          <KpiCard
            detail={card.detail}
            delta={card.delta}
            index={index}
            key={card.key}
            label={card.label}
            useCompactNumbers={overviewUseCompactNumbers}
            valueMeta={card.valueMeta}
          />
        ))}
      </section>

      <section className="overview-grid overview-grid--dynamic overview-grid--equal-height">
        <ChartPanel
          badge={performance.rangeLabel}
          className="overview-widget overview-widget--compact conversations-pie-panel objections-pie-panel"
          index={0}
          sectionId="performance-verdict"
          style={{ '--overview-span': 4 }}
          subtitle="How reviewed replies resolved"
          title="Verdict distribution"
        >
          {performance.verdictDistribution.length ? (
            <>
              <div className="objections-pie-figure">
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeVerdictIndex ?? undefined}
                      activeShape={ActivePieShape}
                      cx="50%"
                      cy="50%"
                      data={performance.verdictDistribution}
                      dataKey="value"
                      innerRadius="49%"
                      onMouseEnter={(_, index) => setActiveVerdictIndex(index)}
                      onMouseLeave={() => setActiveVerdictIndex(null)}
                      outerRadius="90%"
                      paddingAngle={4}
                    >
                      {performance.verdictDistribution.map((entry, index) => (
                        <Cell
                          fill={entry.color}
                          fillOpacity={
                            activeVerdictIndex === null || activeVerdictIndex === index ? 1 : 0.42
                          }
                          key={entry.key}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<StandardTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <MixLegend items={performance.verdictDistribution} />
            </>
          ) : (
            <EmptyState
              copy="Reviewed verdict mix will appear here when QA activity lands in the selected window."
              title="No verdict data"
            />
          )}
        </ChartPanel>

        <ChartPanel
          badge={performance.rangeLabel}
          className="overview-widget overview-widget--wide"
          index={1}
          sectionId="performance-review-trend"
          style={{ '--overview-span': 8 }}
          subtitle="Weighted review quality"
          title="Review score trend"
        >
          <TraceLineChart
            color="var(--accent-violet)"
            data={performance.reviewScoreTrend}
            formatValue={(value) => `${Math.round(Number(value) || 0)}%`}
            height={290}
            lineKey={`performance-quality-${performance.rangeKey}`}
            yTickCount={5}
          />
        </ChartPanel>
      </section>

      <section className="overview-grid overview-grid--dynamic overview-grid--equal-height">
        <ChartPanel
          badge={performance.rangeLabel}
          className="overview-widget overview-widget--wide"
          index={0}
          sectionId="performance-quality-stage"
          style={{ '--overview-span': 6 }}
          subtitle="Where reply quality is strongest right now"
          title="Quality by stage"
        >
          {performance.qualityByStage.length ? (
            <div className="performance-bar-figure">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart
                  data={performance.qualityByStage}
                  margin={{ top: 8, right: 12, left: -16, bottom: 8 }}
                >
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(value) => `${Math.round(value)}%`} />
                  <Tooltip content={<StandardTooltip />} />
                  <Bar dataKey="value" name="Score %" radius={[12, 12, 4, 4]}>
                    {performance.qualityByStage.map((entry) => (
                      <Cell fill={entry.color} key={entry.key} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              copy="No reviewed stage data is visible in this range yet."
              title="No stage quality data"
            />
          )}
        </ChartPanel>

        <ChartPanel
          badge={performance.rangeLabel}
          className="overview-widget overview-widget--wide"
          index={1}
          sectionId="performance-pressure"
          style={{ '--overview-span': 6 }}
          subtitle="Where reviewed load is actually producing intervention pressure"
          title="Guardrail pressure snapshot"
        >
          <div className="detail-card-grid performance-pressure-grid">
            <div className="detail-card">
              <span>Reviewed replies</span>
              <strong>{integerFormatter.format(pressureSummary.reviewed)}</strong>
            </div>
            <div className="detail-card">
              <span>Guardrail touches</span>
              <strong>{integerFormatter.format(pressureSummary.guardrail)}</strong>
            </div>
            <div className="detail-card">
              <span>Average touch rate</span>
              <strong>{Math.round(pressureSummary.averageTouchRate)}%</strong>
            </div>
          </div>

          {pressureSummary.windows.length ? (
            <div className="list-stack performance-pressure-list">
              {pressureSummary.windows.map((item) => (
                <div className="list-row performance-pressure-row" key={item.label}>
                  <div>
                    <strong>{item.label}</strong>
                    <p>
                      {item.reviewed}
                      {' reviewed, '}
                      {item.guardrail}
                      {' touches'}
                    </p>
                  </div>
                  <div className="performance-pressure-meta">
                    <div className="performance-pressure-meter">
                      <span style={{ '--performance-pressure-fill': `${Math.min(item.touchRate, 100)}%` }} />
                    </div>
                    <StatusPill tone={item.tone}>{Math.round(item.touchRate)}%</StatusPill>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              copy="No reviewed load is visible in the current window yet."
              title="No pressure data"
            />
          )}
        </ChartPanel>
      </section>

      <section className="overview-grid overview-grid--dynamic">
        <ChartPanel
          badge={`${performance.coachingQueue.length} in queue`}
          className="overview-widget overview-widget--column"
          index={0}
          sectionId="performance-coaching"
          style={{ '--overview-span': 4 }}
          subtitle="Reviewed threads needing a second pass"
          title="Coaching queue"
        >
          <div className="issue-stack list-stack--scrollable">
            {performance.coachingQueue.length ? (
              performance.coachingQueue.map((item) => (
                <button
                  className="issue-card issue-card--clickable"
                  key={item.id}
                  onClick={() => setSelectedLeadId(item.leadId)}
                  type="button"
                >
                  <div className="issue-card-header">
                    <p>{item.displayName}</p>
                    <StatusPill tone={item.healthTone}>{item.reviewLabel}</StatusPill>
                  </div>
                  <div className="conversation-list-badges">
                    <StageBadge tone={item.stageTone}>{item.stageLabel}</StageBadge>
                    <StatusPill tone={item.healthTone}>{item.healthLabel}</StatusPill>
                  </div>
                  <div className="issue-card-footer">
                    <span>{item.note}</span>
                    <small>{item.lastActivityLabel}</small>
                  </div>
                </button>
              ))
            ) : (
              <EmptyState
                copy="Nothing in the visible performance queue needs a coaching pass right now."
                title="Healthy review queue"
              />
            )}
          </div>
        </ChartPanel>

        <ChartPanel
          badge={performance.rangeLabel}
          className="overview-widget overview-widget--column"
          index={1}
          sectionId="performance-corrections"
          style={{ '--overview-span': 4 }}
          subtitle="What QA is correcting most often"
          title="Top correction themes"
        >
          <div className="list-stack">
            {performance.topCorrectionThemes.length ? (
              performance.topCorrectionThemes.map((item) => (
                <div className="list-row" key={item.key}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.note}</p>
                  </div>
                  <div className="list-row-meta">
                    <StatusPill tone={item.tone}>{item.count}</StatusPill>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                copy="Correction themes will show up here once reviewed replies accumulate in-range."
                title="No correction themes"
              />
            )}
          </div>
        </ChartPanel>

        <ChartPanel
          badge={performance.rangeLabel}
          className="overview-widget overview-widget--column"
          index={2}
          sectionId="performance-strongest"
          style={{ '--overview-span': 4 }}
          subtitle="The cleanest-performing segment right now"
          title="Strongest segment"
        >
          <article className="issue-card performance-highlight-card">
            <div className="issue-card-header">
              <p>{performance.strongestSegment.label}</p>
              <StatusPill tone={performance.strongestSegment.tone}>
                {performance.strongestSegment.value}
              </StatusPill>
            </div>
            <div className="issue-card-footer">
              <span>{performance.strongestSegment.detail}</span>
              <small>Current window</small>
            </div>
          </article>
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
