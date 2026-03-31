import StatusPill from './StatusPill'

export default function StageBadge({ children, tone = 'neutral' }) {
  return (
    <span className="stage-badge">
      <StatusPill tone={tone}>{children}</StatusPill>
    </span>
  )
}
