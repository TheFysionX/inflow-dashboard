import StatusPill from './StatusPill'

export default function TimelineList({ items }) {
  return (
    <div className="timeline-list">
      {items.map((item) => (
        <div className="timeline-item" key={item.key}>
          <div className="timeline-marker" />
          <div className="timeline-copy">
            <div className="timeline-copy-header">
              <strong>{item.label}</strong>
              <StatusPill tone={item.tone}>{item.dateLabel}</StatusPill>
            </div>
            <p>{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
