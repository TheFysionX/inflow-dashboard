import { motion, useReducedMotion } from 'framer-motion'

export default function AnimatedPage({
  children,
  className = '',
  layout = false,
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      layout={layout}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}
