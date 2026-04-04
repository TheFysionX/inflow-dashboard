export default function RouteLoader({
  className = '',
  label = 'Loading dashboard',
  title = 'Syncing the next view',
}) {
  return (
    <div
      aria-label={label}
      aria-live="polite"
      className={`route-loader-shell ${className}`.trim()}
      role="status"
    >
      <div className="route-loader-geometry" aria-hidden="true">
        <div className="route-loader-stage">
          <span className="route-loader-beam route-loader-beam--horizontal" />
          <span className="route-loader-beam route-loader-beam--diag-left" />
          <span className="route-loader-beam route-loader-beam--diag-right" />

          <span className="route-loader-frame route-loader-frame--outer" />
          <span className="route-loader-frame route-loader-frame--middle" />
          <span className="route-loader-frame route-loader-frame--inner" />
          <span className="route-loader-core-shell" />
          <span className="route-loader-core" />
        </div>
      </div>

      <div className="route-loader-copy">
        <p className="sidebar-caption">{label}</p>
        <h2>{title}</h2>
      </div>
    </div>
  )
}
