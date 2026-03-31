import { motion, useReducedMotion } from 'framer-motion'

export default function ChartPanel({
  title,
  subtitle,
  badge,
  actionLabel,
  onAction,
  children,
  className = '',
  index = 0,
  style,
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.article
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      className={`surface-card chart-panel ${className}`.trim()}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      layout
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
        </div>
      </div>
      {children}
    </motion.article>
  )
}
