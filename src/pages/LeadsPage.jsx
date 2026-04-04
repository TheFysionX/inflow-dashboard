import { useMemo, useState } from 'react'
import {
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import AnimatedPage from '../components/ui/AnimatedPage'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import ChartPanel from '../components/ui/ChartPanel'
import DataTable from '../components/ui/DataTable'
import FilterChips from '../components/ui/FilterChips'
import LeadDetailDrawer from '../components/ui/LeadDetailDrawer'
import StageBadge from '../components/ui/StageBadge'
import StatusPill from '../components/ui/StatusPill'
import { useDashboard } from '../context/AppContext'
import { getLeadDetailModel, getLeadsModel } from '../data/selectors'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="chart-tooltip">
      <strong>{payload[0]?.payload?.name ?? label}</strong>
      {payload.map((entry) => (
        <div className="chart-tooltip-row" key={`${entry.name}-${entry.value}`}>
          <span>{entry.name}</span>
          <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
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

function RadialMix({ items }) {
  const radialData = items.map((item, index) => ({
    ...item,
    fill: item.color,
    max: Math.max(items[0]?.value ?? 0, item.value),
    order: items.length - index,
  }))

  return (
    <div className="radial-mix-shell">
      <ResponsiveContainer height={220} width="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          data={radialData}
          endAngle={-270}
          innerRadius="26%"
          outerRadius="100%"
          startAngle={90}
        >
          <PolarAngleAxis domain={[0, Math.max(...radialData.map((item) => item.max), 1)]} tick={false} type="number" />
          <RadialBar
            background={{ fill: 'rgba(143, 109, 255, 0.12)' }}
            cornerRadius={14}
            dataKey="value"
          />
          <Tooltip content={<ChartTooltip />} />
        </RadialBarChart>
      </ResponsiveContainer>
      <MixLegend items={items} />
    </div>
  )
}

export default function LeadsPage() {
  const { dataset, activeClientId, rangeSelection } = useDashboard()
  const [sorting, setSorting] = useState([
    { id: 'lastActivityAt', desc: true },
  ])
  const [filters, setFilters] = useState({
    stage: 'all',
    qualification: 'all',
    bookingIntent: 'all',
    objection: 'all',
    experience: 'all',
    goal: 'all',
  })
  const [selectedLeadId, setSelectedLeadId] = useState('')

  const leads = useMemo(
    () => getLeadsModel(dataset, activeClientId, rangeSelection),
    [activeClientId, dataset, rangeSelection],
  )

  const filteredRows = useMemo(
    () =>
      leads.rows.filter((row) => {
        if (filters.stage !== 'all' && row.stageKey !== filters.stage) {
          return false
        }

        if (filters.qualification !== 'all' && row.qualificationKey !== filters.qualification) {
          return false
        }

        if (filters.bookingIntent !== 'all' && row.bookingIntentKey !== filters.bookingIntent) {
          return false
        }

        if (filters.objection !== 'all' && row.objectionKey !== filters.objection) {
          return false
        }

        if (filters.experience !== 'all' && row.experienceKey !== filters.experience) {
          return false
        }

        if (filters.goal !== 'all' && row.goalKey !== filters.goal) {
          return false
        }

        return true
      }),
    [
      filters.bookingIntent,
      filters.experience,
      filters.goal,
      filters.objection,
      filters.qualification,
      filters.stage,
      leads.rows,
    ],
  )

  const detail = useMemo(
    () => getLeadDetailModel(dataset, activeClientId, selectedLeadId),
    [activeClientId, dataset, selectedLeadId],
  )

  const columns = useMemo(
    () => [
      {
        accessorKey: 'displayName',
        header: 'Lead',
        cell: ({ row }) => (
          <div className="table-primary-cell">
            <strong>{row.original.displayName}</strong>
            <small>{row.original.source}</small>
          </div>
        ),
      },
      {
        accessorKey: 'stageLabel',
        header: 'Current Stage',
        cell: ({ row }) => (
          <StageBadge tone={row.original.stageTone}>{row.original.stageLabel}</StageBadge>
        ),
      },
      { accessorKey: 'experienceLabel', header: 'Experience' },
      { accessorKey: 'workRoleLabel', header: 'Work Role' },
      { accessorKey: 'commitmentLabel', header: 'Commitment' },
      { accessorKey: 'goalLabel', header: 'Goal Type' },
      {
        accessorKey: 'qualificationLabel',
        header: 'Qualification',
        cell: ({ row }) => (
          <StatusPill tone={row.original.qualificationTone}>
            {row.original.qualificationLabel}
          </StatusPill>
        ),
      },
      { accessorKey: 'objectionLabel', header: 'Objection' },
      { accessorKey: 'bookingIntentLabel', header: 'Booking Intent' },
      { accessorKey: 'confirmedLabel', header: 'Confirmed Time' },
      {
        accessorKey: 'lastActivityAt',
        header: 'Last Activity',
        cell: ({ row }) => row.original.lastActivityLabel,
      },
      {
        accessorKey: 'statusLabel',
        header: 'Status',
        cell: ({ row }) => (
          <StatusPill tone={row.original.statusTone}>
            {row.original.statusLabel}
          </StatusPill>
        ),
      },
    ],
    [],
  )

  return (
    <AnimatedPage className="page-stack">
      <section className="summary-card-grid search-jump-target" id="leads-summary">
        {leads.summaryCards.map((card) => (
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
          badge={leads.rangeLabel}
          className="overview-widget overview-widget--compact leads-chart-panel"
          sectionId="leads-quality-mix"
          subtitle="Lead qualification"
          title="Lead quality mix"
        >
          <ResponsiveContainer height={200} width="100%">
            <PieChart>
              <Pie
                data={leads.qualityMix}
                dataKey="value"
                innerRadius={42}
                outerRadius={68}
                paddingAngle={3}
              >
                {leads.qualityMix.map((entry) => (
                  <Cell fill={entry.color} key={entry.key} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <MixLegend items={leads.qualityMix} />
        </ChartPanel>

        <ChartPanel
          badge={leads.rangeLabel}
          className="overview-widget overview-widget--compact leads-chart-panel"
          sectionId="leads-goal-mix"
          subtitle="What people want"
          title="Goal type mix"
        >
          <ResponsiveContainer height={200} width="100%">
            <PieChart>
              <Pie
                data={leads.goalMix}
                dataKey="value"
                innerRadius={38}
                outerRadius={72}
                paddingAngle={4}
              >
                {leads.goalMix.map((entry) => (
                  <Cell fill={entry.color} key={entry.key} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <MixLegend items={leads.goalMix} />
        </ChartPanel>

        <ChartPanel
          badge={leads.rangeLabel}
          className="overview-widget overview-widget--compact leads-chart-panel"
          sectionId="leads-experience-mix"
          subtitle="Lead maturity"
          title="Experience mix"
        >
          <RadialMix items={leads.experienceMix} />
        </ChartPanel>

        <ChartPanel
          badge={leads.rangeLabel}
          className="overview-widget overview-widget--compact leads-chart-panel"
          sectionId="leads-source-bucket-mix"
          subtitle="Where leads are coming from"
          title="Source bucket mix"
        >
          <RadialMix items={leads.sourceBucketMix} />
        </ChartPanel>
      </section>

      <section className="surface-card data-table-panel search-jump-target" id="leads-database">
        <div className="data-table-panel-header">
          <div>
            <p className="sidebar-caption">Lead filters</p>
            <h2>Lead database</h2>
          </div>
          <StatusPill tone="info">{leads.rangeLabel}</StatusPill>
        </div>

        <div className="filter-toolbar filter-toolbar--inline filter-toolbar--attached">
          <FilterChips
            allLabel="All stages"
            label="Stage"
            onChange={(value) => setFilters((current) => ({ ...current, stage: value }))}
            options={leads.filterOptions.stages}
            value={filters.stage}
          />
          <FilterChips
            allLabel="All qualification"
            label="Qualification"
            onChange={(value) =>
              setFilters((current) => ({ ...current, qualification: value }))
            }
            options={leads.filterOptions.qualifications}
            value={filters.qualification}
          />
          <FilterChips
            allLabel="All booking intent"
            label="Booking intent"
            onChange={(value) =>
              setFilters((current) => ({ ...current, bookingIntent: value }))
            }
            options={leads.filterOptions.bookingIntents}
            value={filters.bookingIntent}
          />
          <FilterChips
            allLabel="All objections"
            label="Objection"
            onChange={(value) => setFilters((current) => ({ ...current, objection: value }))}
            options={leads.filterOptions.objections}
            value={filters.objection}
          />
          <FilterChips
            allLabel="All experience"
            label="Experience"
            onChange={(value) => setFilters((current) => ({ ...current, experience: value }))}
            options={leads.filterOptions.experienceLevels}
            value={filters.experience}
          />
          <FilterChips
            allLabel="All goals"
            label="Goal type"
            onChange={(value) => setFilters((current) => ({ ...current, goal: value }))}
            options={leads.filterOptions.goalTypes}
            value={filters.goal}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredRows}
          emptyCopy="No leads match the current CRM filters."
          emptyTitle="No leads in this filtered view"
          onRowClick={(row) => setSelectedLeadId(row.id)}
          selectedRowId={selectedLeadId}
          sorting={sorting}
          onSortingChange={setSorting}
        />
      </section>

      <LeadDetailDrawer
        lead={detail}
        onClose={() => setSelectedLeadId('')}
        open={Boolean(selectedLeadId)}
      />
    </AnimatedPage>
  )
}
