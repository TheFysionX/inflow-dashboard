import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { quickSearchEntries, searchDashboard } from '../../config/searchIndex'
import {
  brandConfig,
  navigationItems,
  overviewRangeOptions,
} from '../../config/navigation'
import { useDashboard } from '../../context/AppContext'
import { getFreshnessMeta } from '../../lib/freshness'
import { scrollToSearchTarget } from '../../lib/searchNavigation'
import useDashboardNavigate from '../../lib/useDashboardNavigate'
import { ArrowRightIcon, CloseIcon, NavIcon, SearchIcon } from '../ui/Icons'
import RangeSelector from '../ui/RangeSelector'
import StatusPill from '../ui/StatusPill'
import ProfileMenu from './ProfileMenu'

export default function Topbar() {
  const navigate = useDashboardNavigate()
  const location = useLocation()
  const {
    activeClientId,
    clients,
    dataset,
    rangeSelection,
    setCustomRange,
    setRangePreset,
  } = useDashboard()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeResultIndex, setActiveResultIndex] = useState(0)
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
  const searchResults = useMemo(
    () =>
      searchQuery.trim()
        ? searchDashboard(searchQuery, 8)
        : quickSearchEntries.slice(0, 6),
    [searchQuery],
  )
  const activeClient = useMemo(
    () => clients.find((client) => client.id === activeClientId) ?? clients[0],
    [activeClientId, clients],
  )
  const freshness = useMemo(
    () =>
      getFreshnessMeta(
        dataset?.referenceNow,
        activeClient?.timezone ?? 'America/Los_Angeles',
      ),
    [activeClient?.timezone, dataset?.referenceNow],
  )

  useEffect(() => {
    setActiveResultIndex(searchResults.length ? 0 : -1)
  }, [searchQuery, searchResults.length])

  function closeSearch({ clear = false } = {}) {
    setSearchOpen(false)

    if (clear) {
      setSearchQuery('')
    }
  }

  function handleSearchSelect(result) {
    const targetHash = result.sectionId ? `#${result.sectionId}` : ''

    if (location.pathname === result.path && (!targetHash || location.hash === targetHash)) {
      if (result.sectionId) {
        scrollToSearchTarget(result.sectionId)
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      }
    } else {
      navigate(`${result.path}${targetHash}`)
    }

    setSearchQuery('')
    setSearchOpen(false)
  }

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
                className="topbar-search-shell"
                exit={{ opacity: 0, width: 48 }}
                initial={{ opacity: 0, width: 48 }}
                key="search-open"
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="topbar-search is-open">
                  <span className="topbar-search-icon">
                    <SearchIcon size={16} />
                  </span>
                  <motion.input
                    animate={{ opacity: 1, width: 424 }}
                    aria-label="Search dashboard"
                    autoFocus
                    initial={{ opacity: 0, width: 0 }}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        closeSearch({ clear: true })
                        return
                      }

                      if (event.key === 'ArrowDown') {
                        event.preventDefault()
                        setActiveResultIndex((current) =>
                          searchResults.length ? (current + 1) % searchResults.length : -1,
                        )
                        return
                      }

                      if (event.key === 'ArrowUp') {
                        event.preventDefault()
                        setActiveResultIndex((current) =>
                          searchResults.length
                            ? (current - 1 + searchResults.length) % searchResults.length
                            : -1,
                        )
                        return
                      }

                      if (event.key === 'Enter' && searchResults.length) {
                        event.preventDefault()
                        handleSearchSelect(
                          searchResults[Math.max(activeResultIndex, 0)] ?? searchResults[0],
                        )
                      }
                    }}
                    placeholder="Search page, KPI, or chart"
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    type="text"
                    value={searchQuery}
                  />
                  <button
                    aria-label="Close search"
                    className="topbar-search-close"
                    onClick={() => closeSearch({ clear: true })}
                    type="button"
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>

                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="topbar-search-results"
                  initial={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="topbar-search-results-list">
                    {searchResults.length ? (
                      searchResults.map((result, index) => (
                        <button
                          className={`topbar-search-result ${
                            index === activeResultIndex ? 'is-active' : ''
                          }`}
                          key={result.id}
                          onClick={() => handleSearchSelect(result)}
                          onMouseEnter={() => setActiveResultIndex(index)}
                          type="button"
                        >
                          <span className="topbar-search-result-icon">
                            <NavIcon name={result.pageIcon} size={16} />
                          </span>
                          <span className="topbar-search-result-copy">
                            <strong>{result.title}</strong>
                            <span>{result.description}</span>
                          </span>
                          <span className="topbar-search-result-meta">
                            <small>{result.pageLabel}</small>
                            <ArrowRightIcon size={14} />
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="topbar-search-empty">
                        <strong>No results found</strong>
                        <span>Try a page name, KPI, or chart title.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
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
        <StatusPill tone="info" title={freshness.label}>
          {freshness.shortLabel}
        </StatusPill>
        <ProfileMenu />
      </div>
    </header>
  )
}
