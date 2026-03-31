import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

export default function LeadsPage() {
  const { dataset, activeClientId, rangeSelection, overviewUseCompactNumbers } = useDashboard()
  const [sorting, setSorting] = useState([
    { id: 'createdAt', desc: true },
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
      <section className="summary-card-grid">
        {leads.summaryCards.map((card) => (
          <article className="surface-card summary-card" key={card.key}>
            <p className="sidebar-caption">{card.label}</p>
            <strong className="summary-card-value">
              <AnimatedNumber
                compact={overviewUseCompactNumbers}
                value={card.value}
              />
            </strong>
            <p className="summary-card-detail">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="surface-card filter-toolbar-panel">
        <div className="data-table-panel-header">
          <div>
            <p className="sidebar-caption">Lead filters</p>
            <h2>Lead database</h2>
          </div>
          <StatusPill tone="info">{filteredRows.length} visible</StatusPill>
        </div>

        <div className="filter-toolbar">
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
      </section>

      <section className="surface-card data-table-panel">
        <div className="data-table-panel-header">
          <div>
            <p className="sidebar-caption">CRM table</p>
            <h2>Leads in view</h2>
          </div>
          <StatusPill tone="info">{leads.rangeLabel}</StatusPill>
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

      <section className="overview-grid overview-grid--dynamic">
        <ChartPanel
          badge={leads.rangeLabel}
          className="overview-widget overview-widget--compact"
          subtitle="Lead qualification"
          title="Lead quality mix"
        >
          <ResponsiveContainer height={240} width="100%">
            <PieChart>
              <Pie
                data={leads.qualityMix}
                dataKey="value"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
              >
                {leads.qualityMix.map((entry) => (
                  <Cell fill={entry.color} key={entry.key} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          badge="Goal mix"
          className="overview-widget overview-widget--compact"
          subtitle="What people want"
          title="Goal type mix"
        >
          <ResponsiveContainer height={240} width="100%">
            <BarChart data={leads.goalMix} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}>
              <XAxis dataKey="name" hide />
              <YAxis width={96} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                {leads.goalMix.map((entry) => (
                  <Cell fill={entry.color} key={entry.key} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          badge="Experience"
          className="overview-widget overview-widget--compact"
          subtitle="Lead maturity"
          title="Experience mix"
        >
          <ResponsiveContainer height={240} width="100%">
            <BarChart data={leads.experienceMix} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}>
              <XAxis dataKey="name" hide />
              <YAxis width={96} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                {leads.experienceMix.map((entry) => (
                  <Cell fill={entry.color} key={entry.key} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          badge="Commitment"
          className="overview-widget overview-widget--compact"
          subtitle="Readiness"
          title="Commitment mix"
        >
          <ResponsiveContainer height={240} width="100%">
            <BarChart data={leads.commitmentMix} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}>
              <XAxis dataKey="name" hide />
              <YAxis width={96} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                {leads.commitmentMix.map((entry) => (
                  <Cell fill={entry.color} key={entry.key} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
