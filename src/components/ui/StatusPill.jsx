export default function StatusPill({
  children,
  tone = 'neutral',
  className = '',
  title,
}) {
  const normalizedTone = tone === 'negative' ? 'danger' : tone

  return (
    <span
      className={`status-pill status-pill--${normalizedTone} ${className}`.trim()}
      title={title}
    >
      {children}
    </span>
  )
}
