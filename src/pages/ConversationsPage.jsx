import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts'
import AnimatedPage from '../components/ui/AnimatedPage'
import ChartPanel from '../components/ui/ChartPanel'
import DualTraceLineChart from '../components/ui/DualTraceLineChart'
import EmptyState from '../components/ui/EmptyState'
import FilterChips from '../components/ui/FilterChips'
import KpiCard from '../components/ui/KpiCard'
import StageBadge from '../components/ui/StageBadge'
import StatusPill from '../components/ui/StatusPill'
import TimelineList from '../components/ui/TimelineList'
import { useDashboard } from '../context/AppContext'
import { getConversationDetailModel, getConversationsModel } from '../data/selectors'

function StandardTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="chart-tooltip">
      <strong>{payload[0]?.payload?.name ?? label}</strong>
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

function ConversationDetail({ conversation }) {
  if (!conversation) {
    return (
      <EmptyState
        copy="Pick a thread from the left to inspect the transcript preview and conversation state."
        title="Choose a conversation"
      />
    )
  }

  return (
    <div className="conversation-detail-shell">
      <div className="conversation-detail-header">
        <div>
          <p className="sidebar-caption">Conversation detail</p>
          <h2>{conversation.displayName}</h2>
          <p>
            {conversation.source}
            {' · '}
            Created {conversation.createdLabel}
          </p>
        </div>
      </div>

      <div className="conversation-detail-meta">
        <StageBadge tone={conversation.stage.tone}>{conversation.stage.label}</StageBadge>
        <StatusPill tone={conversation.outcome.tone}>{conversation.outcome.label}</StatusPill>
        <StatusPill tone={conversation.health.tone}>{conversation.health.label}</StatusPill>
        <StatusPill tone={conversation.qualification.tone}>
          {conversation.qualification.label}
        </StatusPill>
        <StatusPill tone={conversation.bookingStatus.tone}>
          {conversation.bookingStatus.label}
        </StatusPill>
      </div>

      <div className="detail-card-grid">
        {conversation.summaryCards.map((item) => (
          <div className="detail-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <section className="lead-drawer-section">
        <div className="lead-drawer-section-heading">
          <p className="sidebar-caption">Conversation</p>
          <h3>Transcript preview</h3>
        </div>
        <div className="transcript-stack">
          {conversation.transcriptPreview.map((entry) => (
            <div
              className={`transcript-bubble transcript-bubble--${entry.tone}`}
              key={entry.id}
            >
              <span>{entry.sender}</span>
              <p>{entry.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lead-drawer-section">
        <div className="lead-drawer-section-heading">
          <p className="sidebar-caption">Response guidance</p>
          <h3>Next move</h3>
        </div>
        <div className="detail-callout">
          <strong>Latest approved reply</strong>
          <p>{conversation.latestApprovedReply}</p>
        </div>
        <div className="detail-callout">
          <strong>Next-step suggestion</strong>
          <p>{conversation.nextStepSuggestion}</p>
        </div>
      </section>

      <section className="lead-drawer-section">
        <div className="lead-drawer-section-heading">
          <p className="sidebar-caption">Lead facts</p>
          <h3>Conversation context</h3>
        </div>
        <div className="detail-facts-grid">
          {conversation.facts.map((fact) => (
            <div className="detail-fact" key={fact.label}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="lead-drawer-section">
        <div className="lead-drawer-section-heading">
          <p className="sidebar-caption">Timeline</p>
          <h3>Thread progression</h3>
        </div>
        <TimelineList items={conversation.timeline} />
      </section>
    </div>
  )
}

const THREAD_PAGE_SIZE = 8

export default function ConversationsPage() {
  const { dataset, activeClientId, rangeSelection } = useDashboard()
  const [filters, setFilters] = useState({
    outcome: 'all',
    health: 'all',
    stage: 'all',
  })
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [activeOutcomeIndex, setActiveOutcomeIndex] = useState(null)
  const [activeCloseReasonIndex, setActiveCloseReasonIndex] = useState(null)

  const conversations = useMemo(
    () => getConversationsModel(dataset, activeClientId, rangeSelection),
    [activeClientId, dataset, rangeSelection],
  )

  const filteredRows = useMemo(
    () =>
      conversations.rows.filter((row) => {
        if (filters.outcome !== 'all' && row.outcomeKey !== filters.outcome) {
          return false
        }

        if (filters.health !== 'all' && row.healthKey !== filters.health) {
          return false
        }

        if (filters.stage !== 'all' && row.stageKey !== filters.stage) {
          return false
        }

        return true
      }),
    [conversations.rows, filters.health, filters.outcome, filters.stage],
  )

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / THREAD_PAGE_SIZE))

  useEffect(() => {
    setPageIndex(0)
  }, [filters.health, filters.outcome, filters.stage, rangeSelection])

  useEffect(() => {
    if (pageIndex > pageCount - 1) {
      setPageIndex(Math.max(0, pageCount - 1))
    }
  }, [pageCount, pageIndex])

  const pagedRows = useMemo(
    () =>
      filteredRows.slice(
        pageIndex * THREAD_PAGE_SIZE,
        (pageIndex + 1) * THREAD_PAGE_SIZE,
      ),
    [filteredRows, pageIndex],
  )

  useEffect(() => {
    if (!pagedRows.length) {
      setSelectedConversationId('')
      return
    }

    if (!pagedRows.some((row) => row.id === selectedConversationId)) {
      setSelectedConversationId(pagedRows[0].id)
    }
  }, [pagedRows, selectedConversationId])

  const activeConversationId = pagedRows.some((row) => row.id === selectedConversationId)
    ? selectedConversationId
    : pagedRows[0]?.id ?? ''

  const detail = useMemo(
    () => getConversationDetailModel(dataset, activeClientId, activeConversationId),
    [activeClientId, activeConversationId, dataset],
  )

  return (
    <AnimatedPage className="page-stack">
      <section className="kpi-grid kpi-grid--five">
        {conversations.summaryCards.map((card, index) => (
          <KpiCard
            detail={card.detail}
            delta={card.delta}
            index={index}
            key={card.key}
            label={card.label}
            useCompactNumbers={false}
            value={card.value}
            valueMeta={card.valueMeta}
          />
        ))}
      </section>

      <section className="overview-grid overview-grid--dynamic">
        <ChartPanel
          badge={conversations.rangeLabel}
          className="overview-widget"
          index={0}
          style={{ '--overview-span': 12 }}
          subtitle="Inbound vs outbound activity"
          title="Conversation volume"
        >
          <DualTraceLineChart
            data={conversations.volumeSeries}
            axisFontSize={8.5}
            height={218}
            labelFontSize={8.5}
            labelTargetCount={10}
            lineKey={`conversation-volume-${conversations.rangeKey}`}
            series={[
              { key: 'inbound', label: 'Inbound', color: 'var(--accent-blue)' },
              { key: 'outbound', label: 'Outbound', color: 'var(--accent-pink)' },
            ]}
            viewWidth={720}
            yTickCount={8}
          />
        </ChartPanel>
      </section>

      <section className="overview-grid overview-grid--dynamic overview-grid--equal-height">
        <ChartPanel
          badge={conversations.rangeLabel}
          className="overview-widget overview-widget--compact conversations-pie-panel"
          index={0}
          subtitle="How visible threads resolve in this window"
          title="Thread outcomes"
        >
          <ResponsiveContainer height={220} width="100%">
            <PieChart>
              <Pie
                activeIndex={activeOutcomeIndex ?? undefined}
                activeShape={ActivePieShape}
                data={conversations.outcomeSeries}
                dataKey="value"
                innerRadius={42}
                onMouseEnter={(_, index) => setActiveOutcomeIndex(index)}
                onMouseLeave={() => setActiveOutcomeIndex(null)}
                outerRadius={78}
                paddingAngle={4}
              >
                {conversations.outcomeSeries.map((entry, index) => (
                  <Cell
                    fill={entry.color}
                    fillOpacity={activeOutcomeIndex === null || activeOutcomeIndex === index ? 1 : 0.42}
                    key={entry.key}
                  />
                ))}
              </Pie>
              <Tooltip content={<StandardTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <MixLegend items={conversations.outcomeSeries} />
        </ChartPanel>

        <ChartPanel
          badge={conversations.rangeLabel}
          className="overview-widget overview-widget--compact conversations-pie-panel"
          index={1}
          subtitle="Why threads stop or resolve"
          title="Thread close reasons"
        >
          <ResponsiveContainer height={220} width="100%">
            <PieChart>
              <Pie
                activeIndex={activeCloseReasonIndex ?? undefined}
                activeShape={ActivePieShape}
                data={conversations.closeReasonSeries}
                dataKey="value"
                innerRadius={42}
                onMouseEnter={(_, index) => setActiveCloseReasonIndex(index)}
                onMouseLeave={() => setActiveCloseReasonIndex(null)}
                outerRadius={78}
                paddingAngle={4}
              >
                {conversations.closeReasonSeries.map((entry, index) => (
                  <Cell
                    fill={entry.color}
                    fillOpacity={
                      activeCloseReasonIndex === null || activeCloseReasonIndex === index ? 1 : 0.42
                    }
                    key={entry.key}
                  />
                ))}
              </Pie>
              <Tooltip content={<StandardTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <MixLegend items={conversations.closeReasonSeries} />
        </ChartPanel>
      </section>

      <section className="surface-card conversation-workspace-shell">
        <div className="conversation-workspace-header">
          <div>
            <p className="sidebar-caption">Conversation queue</p>
            <h2>Recent threads</h2>
          </div>
          <StatusPill tone="info">
            {filteredRows.length}
            {' visible'}
          </StatusPill>
        </div>

        <div className="filter-toolbar filter-toolbar--inline filter-toolbar--attached conversation-filter-row">
          <FilterChips
            allLabel="All outcomes"
            label="Outcome"
            onChange={(value) => setFilters((current) => ({ ...current, outcome: value }))}
            options={conversations.filterOptions.outcomes}
            value={filters.outcome}
          />
          <FilterChips
            allLabel="All health"
            label="Health"
            onChange={(value) => setFilters((current) => ({ ...current, health: value }))}
            options={conversations.filterOptions.healthStates}
            value={filters.health}
          />
          <FilterChips
            allLabel="All stages"
            label="Stage"
            onChange={(value) => setFilters((current) => ({ ...current, stage: value }))}
            options={conversations.filterOptions.stages}
            value={filters.stage}
          />
        </div>

        <div className="conversation-workspace">
          <div className="conversation-list-column">
            <div className="conversation-list">
              {pagedRows.length ? (
                pagedRows.map((row) => (
                  <button
                    className={`conversation-list-item ${
                      row.id === activeConversationId ? 'is-active' : ''
                    }`}
                    key={row.id}
                    onClick={() => setSelectedConversationId(row.id)}
                    type="button"
                  >
                    <div className="conversation-list-item-top">
                      <div>
                        <strong>{row.displayName}</strong>
                        <span>{row.source}</span>
                      </div>
                      <span className="conversation-list-time-badge">{row.lastActivityLabel}</span>
                    </div>

                    <div className="conversation-list-badges">
                      <StageBadge tone={row.stageTone}>{row.stageLabel}</StageBadge>
                      <StatusPill tone={row.healthTone}>{row.healthLabel}</StatusPill>
                      <StatusPill tone={row.outcomeTone}>{row.outcomeLabel}</StatusPill>
                    </div>

                    <p className="conversation-list-preview">{row.previewText}</p>

                    <div className="conversation-list-footer">
                      <small>
                        {row.messageCount}
                        {' messages'}
                      </small>
                      <small>
                        {row.firstResponseLabel}
                        {' first reply'}
                      </small>
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState
                  copy="Try widening the health, stage, or outcome filters to bring more threads back into view."
                  title="No conversations match this filter set"
                />
              )}
            </div>

            {filteredRows.length ? (
              <div className="table-pagination conversation-pagination">
                <span>
                  Page{' '}
                  <strong>{pageIndex + 1}</strong>
                  {' of '}
                  <strong>{pageCount}</strong>
                </span>

                <div className="table-pagination-actions">
                  <button
                    className="ghost-button button-small"
                    disabled={pageIndex === 0}
                    onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
                    type="button"
                  >
                    Previous
                  </button>
                  <button
                    className="ghost-button button-small"
                    disabled={pageIndex >= pageCount - 1}
                    onClick={() => setPageIndex((current) => Math.min(pageCount - 1, current + 1))}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="conversation-detail-column">
            <ConversationDetail conversation={detail} />
          </div>
        </div>
      </section>
    </AnimatedPage>
  )
}
