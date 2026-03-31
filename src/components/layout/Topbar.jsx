import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  brandConfig,
  navigationItems,
  overviewRangeOptions,
} from '../../config/navigation'
import { useDashboard } from '../../context/AppContext'
import { CloseIcon, SearchIcon } from '../ui/Icons'
import RangeSelector from '../ui/RangeSelector'
import ProfileMenu from './ProfileMenu'

export default function Topbar() {
  const location = useLocation()
  const { rangeSelection, setCustomRange, setRangePreset } = useDashboard()
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    function handlePointerDown(event) {
      if (!searchRef.current?.contains(event.target)) {
        setSearchOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const currentPage = useMemo(
    () =>
      navigationItems.find((item) => item.path === location.pathname) ??
      navigationItems[0],
    [location.pathname],
  )

  return (
    <header className="topbar">
      <div className="topbar-page">
        <div>
          <p className="sidebar-caption">{brandConfig.subtitle}</p>
          <h1>{currentPage.label}</h1>
        </div>
      </div>

      <div className="topbar-tools">
        <div className="topbar-search-cluster" ref={searchRef}>
          <AnimatePresence initial={false} mode="wait">
            {searchOpen ? (
              <motion.div
                animate={{ opacity: 1, width: 548 }}
                className="topbar-search is-open"
                exit={{ opacity: 0, width: 48 }}
                initial={{ opacity: 0, width: 48 }}
                key="search-open"
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="topbar-search-icon">
                  <SearchIcon size={16} />
                </span>
                <motion.input
                  animate={{ opacity: 1, width: 424 }}
                  aria-label="Search"
                  autoFocus
                  initial={{ opacity: 0, width: 0 }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setSearchOpen(false)
                    }
                  }}
                  placeholder="Search leads or bookings"
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  type="text"
                />
                <button
                  aria-label="Close search"
                  className="topbar-search-close"
                  onClick={() => setSearchOpen(false)}
                  type="button"
                >
                  <CloseIcon size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.button
                animate={{ opacity: 1, scale: 1 }}
                aria-label="Open search"
                className="topbar-search-button"
                exit={{ opacity: 0, scale: 0.94 }}
                initial={{ opacity: 0, scale: 0.94 }}
                key="search-closed"
                onClick={() => setSearchOpen(true)}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                type="button"
              >
                <SearchIcon size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <RangeSelector
          onCustomRangeChange={setCustomRange}
          onPresetChange={setRangePreset}
          options={overviewRangeOptions}
          value={rangeSelection}
        />
        <ProfileMenu />
      </div>
    </header>
  )
}
