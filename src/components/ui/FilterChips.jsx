import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronIcon } from './Icons'

export default function FilterChips({
  label,
  value,
  options,
  onChange,
  allLabel = 'All',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const normalizedOptions = useMemo(
    () => [{ value: 'all', label: allLabel, count: null }, ...(options ?? [])],
    [allLabel, options],
  )

  const activeOption = useMemo(
    () => normalizedOptions.find((option) => option.value === value) ?? normalizedOptions[0],
    [normalizedOptions, value],
  )

  if (!options?.length) {
    return null
  }

  return (
    <div className={`filter-menu ${open ? 'is-open' : ''}`} ref={rootRef}>
      <button
        aria-expanded={open}
        className={`filter-menu-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <div className="filter-menu-copy">
          <span>{label}</span>
          <strong>{activeOption?.label ?? allLabel}</strong>
        </div>
        <ChevronIcon direction={open ? 'up' : 'down'} size={16} />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="filter-menu-popover"
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {normalizedOptions.map((option, index) => (
              <motion.button
                animate={{ opacity: 1, x: 0 }}
                className={option.value === value ? 'filter-menu-option is-active' : 'filter-menu-option'}
                initial={{ opacity: 0, x: -8 }}
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                transition={{
                  duration: 0.16,
                  delay: index * 0.018,
                  ease: [0.22, 1, 0.36, 1],
                }}
                type="button"
              >
                <span>{option.label}</span>
                <small>
                  {option.value === 'all'
                    ? 'All'
                    : `${option.count ?? 0}`}
                </small>
              </motion.button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
