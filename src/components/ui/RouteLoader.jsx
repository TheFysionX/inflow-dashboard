import {
  defaultRouteLoaderVariant,
  originalRouteLoaderVariantKeys,
  routeLoaderVariantKeys,
} from '../../config/loaderVariants'
import ExperimentalRouteLoader from './ExperimentalRouteLoader'

export default function RouteLoader({
  className = '',
  label = 'Loading dashboard',
  title = 'Syncing the next view',
  showCopy = true,
  variant = defaultRouteLoaderVariant,
}) {
  const normalizedVariant = routeLoaderVariantKeys.includes(variant)
    ? variant
    : defaultRouteLoaderVariant
  const isExploratoryVariant = !originalRouteLoaderVariantKeys.includes(normalizedVariant)
  const rootClassName = `route-loader-shell route-loader-shell--variant-${normalizedVariant} ${className}`.trim()
  const accessibilityProps = showCopy
    ? {
        'aria-label': label,
        'aria-live': 'polite',
        role: 'status',
      }
    : {
        'aria-label': `${title} preview`,
        role: 'img',
      }

  return (
    <div className={rootClassName} data-variant={normalizedVariant} {...accessibilityProps}>
      {isExploratoryVariant ? (
        <ExperimentalRouteLoader variant={normalizedVariant} />
      ) : (
        <div className="route-loader-geometry" aria-hidden="true">
          <div className="route-loader-stage">
            <span className="route-loader-beam route-loader-beam--horizontal" />
            <span className="route-loader-beam route-loader-beam--vertical" />
            <span className="route-loader-beam route-loader-beam--diag-left" />
            <span className="route-loader-beam route-loader-beam--diag-right" />
            <span className="route-loader-beam route-loader-beam--diag-left-soft" />
            <span className="route-loader-beam route-loader-beam--diag-right-soft" />

            <span className="route-loader-frame route-loader-frame--halo" />
            <span className="route-loader-frame route-loader-frame--outer" />
            <span className="route-loader-frame route-loader-frame--support" />
            <span className="route-loader-frame route-loader-frame--middle" />
            <span className="route-loader-frame route-loader-frame--inner" />
            <span className="route-loader-core-shell" />
            <span className="route-loader-core" />
          </div>
        </div>
      )}

      {showCopy ? (
        <div className="route-loader-copy">
          <p className="sidebar-caption">{label}</p>
          <h2>{title}</h2>
        </div>
      ) : null}
    </div>
  )
}
