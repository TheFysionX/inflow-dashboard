export default function DeltaBadge({ value, tone = 'neutral' }) {
  return (
    <span className={`delta-badge delta-badge--${tone}`}>
      <span>{value}</span>
    </span>
  )
}
