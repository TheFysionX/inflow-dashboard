import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronIcon } from './Icons'

export default function OptionSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
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

  const activeOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  return (
    <div className={`option-select ${open ? 'is-open' : ''}`} ref={rootRef}>
      <button
        aria-expanded={open}
        className={`option-select-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>{activeOption?.label ?? placeholder}</span>
        <ChevronIcon direction={open ? 'up' : 'down'} size={16} />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="option-select-popover"
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {options.map((option, index) => (
              <motion.button
                animate={{ opacity: 1, x: 0 }}
                className={option.disabled
                  ? 'option-select-option is-disabled'
                  : option.value === value
                    ? 'option-select-option is-active'
                    : 'option-select-option'}
                disabled={option.disabled}
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
                {option.value === value ? <small>Selected</small> : null}
              </motion.button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
