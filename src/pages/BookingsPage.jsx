import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Cell, Funnel, FunnelChart, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts'
import AnimatedPage from '../components/ui/AnimatedPage'
import ChartPanel from '../components/ui/ChartPanel'
import EmptyState from '../components/ui/EmptyState'
import KpiCard from '../components/ui/KpiCard'
import LeadDetailDrawer from '../components/ui/LeadDetailDrawer'
import StatusPill from '../components/ui/StatusPill'
import TraceLineChart from '../components/ui/TraceLineChart'
import {
  useDashboardDataset,
  useDashboardSelection,
} from '../context/AppContext'
import { getBookingsModel, getLeadDetailModel } from '../data/selectors'

const funnelColors = ['#74c7ff', '#8f6dff', '#f49be3']

function StandardTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="chart-tooltip">
      <strong>{payload[0]?.payload?.name ?? payload[0]?.payload?.stage ?? label}</strong>
      {payload.map((entry) => (
        <div className="chart-tooltip-row" key={`${entry.name}-${entry.value}`}>
          <span>{entry.name}</span>
          <strong>
            {typeof entry.value === 'number'
              ? `${Math.round(entry.value * 10) / 10}${entry.name?.includes('Rate') ? '%' : ''}`
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

function getFunnelStageShare(value, baseline) {
  if (!baseline) {
    return 0
  }

  return Math.max(0, Math.min(100, (value / baseline) * 100))
}

function BookingFunnel({ items, activeIndex, onActiveChange, rangeKey }) {
  const baseline = items[0]?.value ?? 0

  return (
    <div className="pipeline-funnel-shell">
      <div className="pipeline-funnel-chart">
        <ResponsiveContainer height="100%" width="100%">
          <FunnelChart>
            <defs>
              <filter id={`funnelGlow-bookings-${rangeKey}`}>
                <feDropShadow
                  dx="0"
                  dy="0"
                  floodColor="rgba(143, 109, 255, 0.46)"
                  stdDeviation="10"
                />
              </filter>
            </defs>
            <Tooltip content={<StandardTooltip />} />
            <Funnel
              animationDuration={940}
              data={items}
              dataKey="value"
              isAnimationActive
              nameKey="stage"
              onMouseLeave={() => onActiveChange(null)}
              stroke="rgba(255,255,255,0.1)"
            >
              {items.map((item, index) => (
                <Cell
                  cursor="pointer"
                  fill={funnelColors[index] ?? funnelColors.at(-1)}
                  fillOpacity={activeIndex === null || index === activeIndex ? 1 : 0.44}
                  filter={index === activeIndex ? `url(#funnelGlow-bookings-${rangeKey})` : undefined}
                  key={item.stage}
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
          key={`bookings-funnel-key-${rangeKey}`}
        >
          <div
            aria-hidden="true"
            className={`funnel-key-baseline ${activeIndex !== null ? 'is-visible' : ''}`}
          />
          {items.map((item, index) => {
            const width = getFunnelStageShare(item.value, baseline)
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
                key={item.stage}
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
                    {item.stage}
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

export default function BookingsPage() {
  const { dataset } = useDashboardDataset()
  const { activeClientId, rangeSelection } = useDashboardSelection()
  const [activeAttendanceIndex, setActiveAttendanceIndex] = useState(null)
  const [activeFunnelIndex, setActiveFunnelIndex] = useState(null)
  const [selectedLeadId, setSelectedLeadId] = useState('')

  const bookings = useMemo(
    () => getBookingsModel(dataset, activeClientId, rangeSelection),
    [activeClientId, dataset, rangeSelection],
  )

  const detail = useMemo(
    () => getLeadDetailModel(dataset, activeClientId, selectedLeadId),
    [activeClientId, dataset, selectedLeadId],
  )

  return (
    <AnimatedPage className="page-stack">
      <section className="kpi-grid search-jump-target" id="bookings-summary">
        {bookings.summaryCards.map((card, index) => (
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
          badge={bookings.rangeLabel}
          className="overview-widget overview-widget--wide overview-panel overview-panel--funnel"
          index={0}
          sectionId="bookings-funnel"
          style={{ '--overview-span': 6 }}
          subtitle="Proposed slots through attended calls"
          title="Booking funnel"
        >
          <BookingFunnel
            activeIndex={activeFunnelIndex}
            items={bookings.funnelSeries}
            onActiveChange={setActiveFunnelIndex}
            rangeKey={bookings.rangeKey}
          />
        </ChartPanel>

        <ChartPanel
          badge={bookings.rangeLabel}
          className="overview-widget overview-widget--wide"
          index={1}
          sectionId="bookings-confirmed-trend"
          style={{ '--overview-span': 6 }}
          subtitle="Confirmed booking volume"
          title="Confirmed calls over time"
        >
          <TraceLineChart
            color="var(--accent-blue)"
            data={bookings.confirmedTrend}
            height={290}
            lineKey={`bookings-confirmed-${bookings.rangeKey}`}
            yTickCount={5}
          />
        </ChartPanel>
      </section>

      <section className="overview-grid overview-grid--dynamic overview-grid--equal-height">
        <ChartPanel
          badge={bookings.rangeLabel}
          className="overview-widget overview-widget--compact conversations-pie-panel"
          index={0}
          sectionId="bookings-attendance"
          style={{ '--overview-span': 4 }}
          subtitle="What happened to completed bookings"
          title="No-show vs attended"
        >
          {bookings.attendanceSeries.length ? (
            <>
              <ResponsiveContainer height={220} width="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeAttendanceIndex ?? undefined}
                    activeShape={ActivePieShape}
                    data={bookings.attendanceSeries}
                    dataKey="value"
                    innerRadius={42}
                    onMouseEnter={(_, index) => setActiveAttendanceIndex(index)}
                    onMouseLeave={() => setActiveAttendanceIndex(null)}
                    outerRadius={78}
                    paddingAngle={4}
                  >
                    {bookings.attendanceSeries.map((entry, index) => (
                      <Cell
                        fill={entry.color}
                        fillOpacity={
                          activeAttendanceIndex === null || activeAttendanceIndex === index ? 1 : 0.42
                        }
                        key={entry.key}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<StandardTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <MixLegend items={bookings.attendanceSeries} />
            </>
          ) : (
            <EmptyState
              copy="Booking outcomes will appear here once calls are completed."
              title="No attendance history"
            />
          )}
        </ChartPanel>

        <ChartPanel
          badge="Next 14 days"
          className="overview-widget overview-widget--compact"
          index={1}
          sectionId="bookings-upcoming"
          style={{ '--overview-span': 4 }}
          subtitle="Calls already on the calendar"
          title="Upcoming bookings"
        >
          <div className="issue-stack list-stack--scrollable">
            {bookings.upcomingBookings.length ? (
              bookings.upcomingBookings.map((item) => (
                <button
                  className="issue-card issue-card--clickable"
                  key={item.id}
                  onClick={() => setSelectedLeadId(item.leadId)}
                  type="button"
                >
                  <div className="issue-card-header">
                    <p>{item.displayName}</p>
                    <StatusPill tone={item.tone}>{item.relativeTime}</StatusPill>
                  </div>
                  <div className="issue-card-footer">
                    <span>
                      {item.time}
                      {' · '}
                      {item.timezone}
                    </span>
                    <small>{item.note}</small>
                  </div>
                </button>
              ))
            ) : (
              <EmptyState
                copy="No future calls are scheduled in the next two weeks."
                title="Open calendar"
              />
            )}
          </div>
        </ChartPanel>

        <ChartPanel
          badge={bookings.atRiskDelta.value}
          className="overview-widget overview-widget--compact"
          index={2}
          sectionId="bookings-at-risk"
          style={{ '--overview-span': 4 }}
          subtitle="Bookings that need intervention"
          title="At-risk bookings"
        >
          <div className="issue-stack list-stack--scrollable">
            {bookings.atRiskBookings.length ? (
              bookings.atRiskBookings.map((item) => (
                <button
                  className="issue-card issue-card--clickable"
                  key={item.id}
                  onClick={() => setSelectedLeadId(item.leadId)}
                  type="button"
                >
                  <div className="issue-card-header">
                    <p>{item.displayName}</p>
                    <StatusPill tone={item.tone}>{item.reason}</StatusPill>
                  </div>
                  <div className="issue-card-footer">
                    <span>{item.note}</span>
                    <small>{item.relativeTime}</small>
                  </div>
                </button>
              ))
            ) : (
              <EmptyState
                copy="Nothing in the booking queue currently needs intervention."
                title="Healthy booking flow"
              />
            )}
          </div>
        </ChartPanel>
      </section>

      <section className="overview-grid overview-grid--dynamic">
        <ChartPanel
          badge={bookings.rangeLabel}
          className="overview-widget overview-widget--wide"
          index={0}
          sectionId="bookings-friction"
          style={{ '--overview-span': 12 }}
          subtitle="What is slowing confirmations right now"
          title="Scheduling friction summary"
        >
          <div className="list-stack">
            {bookings.frictionSummary.length ? (
              bookings.frictionSummary.map((item) => (
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
                copy="No scheduling friction signals are active right now."
                title="Smooth booking flow"
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
