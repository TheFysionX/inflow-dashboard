import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { brandConfig, demoCredentials } from '../../config/navigation'
import { useDashboard } from '../../context/AppContext'
import { ChevronIcon } from '../ui/Icons'

export default function ProfileMenu() {
  const navigate = useNavigate()
  const { logout } = useDashboard()
  const [open, setOpen] = useState(false)
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setConfirmingSignOut(false)
      }
    }

    if (!confirmingSignOut) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [confirmingSignOut])

  function handleSignOut() {
    logout()
    navigate('/login')
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        aria-expanded={open}
        className="profile-button"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <div className="avatar-badge">IN</div>
        <div className="profile-button-copy">
          <strong>{brandConfig.name}</strong>
          <span>{demoCredentials.email}</span>
        </div>
        <ChevronIcon direction={open ? 'up' : 'down'} size={16} />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="profile-dropdown"
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="profile-dropdown-info">
              <span>Signed in as</span>
              <strong>{demoCredentials.email}</strong>
            </div>
            <motion.button
              className="profile-dropdown-row"
              onClick={() => {
                setOpen(false)
                setConfirmingSignOut(true)
              }}
              type="button"
              whileTap={{ scale: 0.985 }}
            >
              <span>Sign out</span>
              <ChevronIcon direction="right" size={14} />
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {confirmingSignOut ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="modal-overlay"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setConfirmingSignOut(false)}
          >
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="modal-panel modal-panel--signout"
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              onClick={(event) => event.stopPropagation()}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="modal-panel-copy">
                <p className="sidebar-caption">Session</p>
                <h3>Confirm sign out</h3>
                <p>You'll return to the sign-in screen for the demo dashboard.</p>
              </div>
              <div className="modal-panel-actions">
                <button
                  className="ghost-button button-small"
                  onClick={() => setConfirmingSignOut(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="secondary-button button-small"
                  onClick={handleSignOut}
                  type="button"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
