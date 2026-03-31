import { motion, useReducedMotion } from 'framer-motion'
import AnimatedNumber from './AnimatedNumber'
import DeltaBadge from './DeltaBadge'
import { DeltaArrowIcon, DeltaNeutralIcon } from './Icons'

export default function KpiCard({
  label,
  value,
  valueMeta,
  detail,
  delta,
  index = 0,
  onClick,
  useCompactNumbers = true,
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.article
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      className={`surface-card kpi-card ${onClick ? 'kpi-card--clickable' : ''}`}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
      transition={{
        duration: 0.38,
        delay: prefersReducedMotion ? 0 : index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={onClick ? { y: -4 } : undefined}
    >
      <button
        className="kpi-card-button"
        disabled={!onClick}
        onClick={onClick}
        type="button"
      >
        <div className="kpi-header">
          <p>{label}</p>
          <DeltaBadge tone={delta?.tone ?? 'neutral'} value={delta?.value ?? '0%'} />
        </div>
        <div className="kpi-value-row">
          <strong>
            <AnimatedNumber
              compact={valueMeta?.compact && useCompactNumbers}
              decimals={valueMeta?.decimals}
              prefix={valueMeta?.prefix}
              suffix={valueMeta?.suffix}
              value={valueMeta?.numericValue ?? 0}
            />
          </strong>
          {delta?.tone ? (
            <motion.span
              animate={{ rotate: delta.tone === 'negative' ? 180 : 0 }}
              className={`kpi-arrow kpi-arrow--${delta.tone}`}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {delta.tone === 'neutral' ? <DeltaNeutralIcon /> : <DeltaArrowIcon direction="up" />}
            </motion.span>
          ) : null}
        </div>
        <p className="kpi-detail">{detail}</p>
      </button>
    </motion.article>
  )
}
