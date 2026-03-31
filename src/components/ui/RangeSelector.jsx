import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { ChevronIcon } from './Icons'
import {
  buildCustomRangeSelection,
  normalizeRangeSelection,
  RANGE_PRESET_LABELS,
} from '../../lib/rangeSelection'

export default function RangeSelector({
  options,
  value,
  onPresetChange,
  onCustomRangeChange,
}) {
  const [open, setOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const selectorRef = useRef(null)
  const normalizedValue = useMemo(() => normalizeRangeSelection(value), [value])
  const [draftRange, setDraftRange] = useState({
    from: normalizedValue.startDate ? new Date(`${normalizedValue.startDate}T00:00:00`) : undefined,
    to: normalizedValue.endDate ? new Date(`${normalizedValue.endDate}T00:00:00`) : undefined,
  })

  useEffect(() => {
    function handlePointerDown(event) {
      if (!selectorRef.current?.contains(event.target)) {
        setOpen(false)
        setCalendarOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (normalizedValue.mode === 'custom') {
      setDraftRange({
        from: new Date(`${normalizedValue.startDate}T00:00:00`),
        to: new Date(`${normalizedValue.endDate}T00:00:00`),
      })
    }
  }, [normalizedValue.endDate, normalizedValue.mode, normalizedValue.startDate])

  const currentLabel = normalizedValue.label

  return (
    <div className={`range-selector-menu ${open ? 'is-open' : ''}`} ref={selectorRef}>
      <button
        aria-expanded={open}
        className="range-selector-trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>{currentLabel}</span>
        <ChevronIcon direction={open ? 'up' : 'down'} size={16} />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="range-selector-popover"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="range-selector-presets">
              {options.map((option, index) => (
                <motion.button
                  animate={{ opacity: 1, x: 0 }}
                  className={option === normalizedValue.preset ? 'range-option is-active' : 'range-option'}
                  initial={{ opacity: 0, x: -8 }}
                  key={option}
                  onClick={() => {
                    onPresetChange(option)
                    setCalendarOpen(false)
                    setOpen(false)
                  }}
                  transition={{
                    duration: 0.16,
                    delay: index * 0.018,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  type="button"
                >
                  <span>{RANGE_PRESET_LABELS[option] ?? option}</span>
                  {option === normalizedValue.preset ? <small>Current</small> : null}
                </motion.button>
              ))}
            </div>

            <button
              className={`range-option range-option--custom ${
                calendarOpen || normalizedValue.mode === 'custom' ? 'is-active' : ''
              }`}
              onClick={() => setCalendarOpen((current) => !current)}
              type="button"
            >
              <span>Custom range</span>
              <small>{calendarOpen ? 'Hide' : 'Select dates'}</small>
            </button>

            <AnimatePresence initial={false}>
              {calendarOpen ? (
                <motion.div
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  className="range-calendar-shell"
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="range-calendar-summary">
                    <strong>Custom range</strong>
                    <span>
                      {draftRange.from && draftRange.to
                        ? buildCustomRangeSelection(draftRange.from, draftRange.to).label
                        : 'Choose a start and end date'}
                    </span>
                  </div>

                  <div className="range-calendar">
                    <DayPicker
                      defaultMonth={draftRange.from}
                      mode="range"
                      numberOfMonths={2}
                      onSelect={(nextRange) => {
                        setDraftRange({
                          from: nextRange?.from,
                          to: nextRange?.to,
                        })
                      }}
                      selected={draftRange}
                    />
                  </div>

                  <div className="range-calendar-actions">
                    <button
                      className="ghost-button button-small"
                      onClick={() => {
                        setDraftRange({ from: undefined, to: undefined })
                        setCalendarOpen(false)
                      }}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="secondary-button button-small"
                      disabled={!draftRange.from || !draftRange.to}
                      onClick={() => {
                        if (!draftRange.from || !draftRange.to) {
                          return
                        }

                        onCustomRangeChange(draftRange.from, draftRange.to)
                        setOpen(false)
                        setCalendarOpen(false)
                      }}
                      type="button"
                    >
                      Apply range
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
