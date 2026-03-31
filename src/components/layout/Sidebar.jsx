import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import inflowLogo from '../../assets/inflow-logo.png'
import { navigationItems } from '../../config/navigation'
import { useDashboard } from '../../context/AppContext'
import { ChevronIcon, NavIcon } from '../ui/Icons'

export default function Sidebar() {
  const { sidebarExpanded, toggleSidebar } = useDashboard()
  const prefersReducedMotion = useReducedMotion()
  const [labelsVisible, setLabelsVisible] = useState(sidebarExpanded)

  useEffect(() => {
    let timeoutId = 0

    if (sidebarExpanded) {
      timeoutId = window.setTimeout(() => {
        setLabelsVisible(true)
      }, 220)
    } else {
      setLabelsVisible(false)
    }

    return () => window.clearTimeout(timeoutId)
  }, [sidebarExpanded])

  return (
    <motion.aside
      animate={
        prefersReducedMotion
          ? undefined
          : { opacity: 1, x: 0, width: sidebarExpanded ? 324 : 132 }
      }
      className={`sidebar ${sidebarExpanded ? 'is-expanded' : 'is-collapsed'}`}
      initial={prefersReducedMotion ? false : { opacity: 0, x: -24, width: 132 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="sidebar-header">
        <div className="sidebar-brand-mark">
          <img alt="Inflow" src={inflowLogo} />
        </div>
      </div>

      <div className="sidebar-body">
        <div className="sidebar-panel">
          <nav className="sidebar-nav">
            {navigationItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                }
                key={item.path}
                to={item.path}
                title={item.label}
              >
                <span className="sidebar-link-mark">
                  <NavIcon name={item.icon} />
                </span>
                <motion.span
                  animate={prefersReducedMotion
                    ? undefined
                    : labelsVisible
                      ? { opacity: 1, x: 0, maxWidth: 180 }
                      : { opacity: 0, x: -8, maxWidth: 0 }}
                  className={`sidebar-link-copy ${labelsVisible ? 'is-visible' : ''}`}
                  initial={false}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <strong>{item.label}</strong>
                </motion.span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-rail">
          <button
            aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            className="sidebar-toggle"
            onClick={toggleSidebar}
            type="button"
          >
            <ChevronIcon direction={sidebarExpanded ? 'left' : 'right'} size={24} />
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
