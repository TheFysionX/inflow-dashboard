import { motion, useReducedMotion } from 'framer-motion'

export default function ChartPanel({
  title,
  subtitle,
  badge,
  sectionId,
  actionLabel,
  onAction,
  toolLabel,
  onToolAction,
  toolIcon,
  children,
  className = '',
  index = 0,
  layout = false,
  style,
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.article
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      className={`surface-card chart-panel ${sectionId ? 'search-jump-target' : ''} ${className}`.trim()}
      data-search-section={sectionId || undefined}
      id={sectionId}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      layout={layout}
      style={style}
      transition={{
        duration: 0.4,
        delay: prefersReducedMotion ? 0 : index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="panel-heading">
        <div>
          <p className="sidebar-caption">{subtitle}</p>
          <h3>{title}</h3>
        </div>
        <div className="panel-actions">
          {badge ? <div className="panel-badge">{badge}</div> : null}
          {actionLabel ? (
            <button className="panel-link" onClick={onAction} type="button">
              {actionLabel}
            </button>
          ) : null}
          {onToolAction ? (
            <button
              aria-label={toolLabel}
              className="panel-icon-button"
              onClick={onToolAction}
              title={toolLabel}
              type="button"
            >
              {toolIcon}
            </button>
          ) : null}
        </div>
      </div>
      {children}
    </motion.article>
  )
}
