import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AnimatedPage from '../components/ui/AnimatedPage'
import DataTable from '../components/ui/DataTable'
import FilterChips from '../components/ui/FilterChips'
import LeadDetailDrawer from '../components/ui/LeadDetailDrawer'
import StageBadge from '../components/ui/StageBadge'
import StatusPill from '../components/ui/StatusPill'
import ChartPanel from '../components/ui/ChartPanel'
import { useDashboard } from '../context/AppContext'
import {
  getLeadDetailModel,
  getPipelineModel,
} from '../data/selectors'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((entry) => (
        <div className="chart-tooltip-row" key={`${entry.name}-${entry.value}`}>
          <span>{entry.name}</span>
          <strong>
            {typeof entry.value === 'number'
              ? `${Math.round(entry.value * 10) / 10}${entry.name === 'Rate' ? '%' : ''}`
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
          <small>{total ? `${Math.round(item.share)}% of visible leads` : 'No leads in range'}</small>
        </div>
      ))}
    </div>
  )
}

function StageFlow({ movement }) {
  return (
    <div className="stage-flow">
      <div className="stage-flow-row">
        {movement.nodes.map((node, index) => (
          <div className="stage-flow-step" key={node.key}>
            <div
              className="stage-flow-node"
              style={{ '--stage-flow-color': node.color }}
            >
              <span>{node.label}</span>
              <strong>{node.value}</strong>
            </div>
            {index < movement.nodes.length - 1 ? (
              <div className="stage-flow-connector">
                <strong>{movement.links[index]?.value ?? 0}</strong>
                <span>{Math.round(movement.links[index]?.rate ?? 0)}%</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="stage-flow-detour">
        <span>{movement.objectionDetour.label}</span>
        <strong>{movement.objectionDetour.value}</strong>
        <small>{Math.round(movement.objectionDetour.rate)}% of desired-stage leads</small>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const { dataset, activeClientId, rangeSelection } = useDashboard()
  const [sorting, setSorting] = useState([])
  const [filters, setFilters] = useState({
    stage: 'all',
    qualification: 'all',
    objection: 'all',
    bookingStatus: 'all',
  })
  const [selectedLeadId, setSelectedLeadId] = useState('')

  const pipeline = useMemo(
    () => getPipelineModel(dataset, activeClientId, rangeSelection),
    [activeClientId, dataset, rangeSelection],
  )

  const filteredRows = useMemo(
    () =>
      pipeline.rows.filter((row) => {
        if (filters.stage !== 'all' && row.stageKey !== filters.stage) {
          return false
        }

        if (filters.qualification !== 'all' && row.qualificationKey !== filters.qualification) {
          return false
        }

        if (filters.objection !== 'all' && row.objectionKey !== filters.objection) {
          return false
        }

        if (
          filters.bookingStatus !== 'all' &&
          row.bookingStatusLabel !== filters.bookingStatus
        ) {
          return false
        }

        return true
      }),
    [filters.bookingStatus, filters.objection, filters.qualification, filters.stage, pipeline.rows],
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
          <div className="table-stack-cell">
            <StageBadge tone={row.original.stageTone}>{row.original.stageLabel}</StageBadge>
            <small>{row.original.stageAgeLabel}</small>
          </div>
        ),
      },
      {
        accessorKey: 'stageAgeDays',
        header: 'Stage Age',
        cell: ({ row }) => row.original.stageAgeLabel,
      },
      {
        accessorKey: 'lastActivityAt',
        header: 'Last Activity',
        cell: ({ row }) => (
          <div className="table-stack-cell">
            <strong>{row.original.lastActivityLabel}</strong>
            <small>{row.original.lastActivityDetail}</small>
          </div>
        ),
      },
      {
        accessorKey: 'objectionLabel',
        header: 'Main Objection',
      },
      {
        accessorKey: 'qualificationLabel',
        header: 'Qualification',
        cell: ({ row }) => (
          <StatusPill tone={row.original.qualificationTone}>
            {row.original.qualificationLabel}
          </StatusPill>
        ),
      },
      {
        accessorKey: 'bookingStatusLabel',
        header: 'Booking Status',
        cell: ({ row }) => (
          <StatusPill tone={row.original.bookingStatusTone}>
            {row.original.bookingStatusLabel}
          </StatusPill>
        ),
      },
      {
        accessorKey: 'priorityLabel',
        header: 'Suggested Priority',
        cell: ({ row }) => (
          <StatusPill tone={row.original.priorityTone}>
            {row.original.priorityLabel}
          </StatusPill>
        ),
      },
    ],
    [],
  )

  return (
    <AnimatedPage className="page-stack">
      <section className="summary-card-grid">
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

      <section className="overview-grid overview-grid--dynamic">
        <ChartPanel
          badge={pipeline.rangeLabel}
          className="overview-widget overview-widget--wide"
          subtitle="Current stage mix"
          title="Stage distribution"
        >
          <StageDistribution items={pipeline.stageDistribution} />
        </ChartPanel>

        <ChartPanel
          badge="Operational flow"
          className="overview-widget overview-widget--wide"
          subtitle="Derived progression"
          title="Stage movement"
        >
          <StageFlow movement={pipeline.stageMovement} />
        </ChartPanel>
      </section>

      <section className="overview-grid overview-grid--dynamic">
        <ChartPanel
          badge={pipeline.rangeLabel}
          className="overview-widget overview-widget--wide"
          subtitle="Current dwell by stage"
          title="Average time in stage"
        >
          <ResponsiveContainer height={248} width="100%">
            <BarChart
              data={pipeline.avgTimeInStage}
              margin={{ top: 8, right: 12, left: -12, bottom: 8 }}
            >
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Days" radius={[12, 12, 4, 4]}>
                {pipeline.avgTimeInStage.map((entry) => (
                  <Cell fill={entry.color} key={entry.key} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          badge="Stage to next stage"
          className="overview-widget overview-widget--wide"
          subtitle="Advancement efficiency"
          title="Stage completion rate"
        >
          <ResponsiveContainer height={248} width="100%">
            <BarChart
              data={pipeline.completionRate}
              margin={{ top: 8, right: 12, left: -12, bottom: 8 }}
            >
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Rate" radius={[12, 12, 4, 4]}>
                {pipeline.completionRate.map((entry) => (
                  <Cell fill={entry.color} key={entry.key} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      <section className="surface-card data-table-panel">
        <div className="data-table-panel-header">
          <div>
            <p className="sidebar-caption">Pipeline leads</p>
            <h2>Operational watchlist</h2>
          </div>
          <StatusPill tone="info">{filteredRows.length} visible</StatusPill>
        </div>

        <div className="filter-toolbar">
          <FilterChips
            allLabel="All stages"
            label="Stage"
            onChange={(value) => setFilters((current) => ({ ...current, stage: value }))}
            options={pipeline.filterOptions.stages}
            value={filters.stage}
          />
          <FilterChips
            allLabel="All qualification"
            label="Qualification"
            onChange={(value) =>
              setFilters((current) => ({ ...current, qualification: value }))
            }
            options={pipeline.filterOptions.qualifications}
            value={filters.qualification}
          />
          <FilterChips
            allLabel="All objections"
            label="Objection"
            onChange={(value) => setFilters((current) => ({ ...current, objection: value }))}
            options={pipeline.filterOptions.objections}
            value={filters.objection}
          />
          <FilterChips
            allLabel="All booking"
            label="Booking"
            onChange={(value) =>
              setFilters((current) => ({ ...current, bookingStatus: value }))
            }
            options={pipeline.filterOptions.bookingStatuses}
            value={filters.bookingStatus}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredRows}
          emptyCopy="No leads match the current pipeline filters."
          emptyTitle="No leads in this pipeline view"
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
