export default function StatusPill({ children, tone = 'neutral' }) {
  const normalizedTone = tone === 'negative' ? 'danger' : tone

  return <span className={`status-pill status-pill--${normalizedTone}`}>{children}</span>
}
