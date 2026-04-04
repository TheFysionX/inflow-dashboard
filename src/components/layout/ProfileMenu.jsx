import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import packageMeta from '../../../package.json'
import { brandConfig } from '../../config/navigation'
import { useDashboard } from '../../context/AppContext'
import useDashboardNavigate from '../../lib/useDashboardNavigate'
import { ChevronIcon, SettingsIcon } from '../ui/Icons'
import SignOutConfirmModal from '../ui/SignOutConfirmModal'

export default function ProfileMenu() {
  const navigate = useDashboardNavigate()
  const { currentAccount, logout } = useDashboard()
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
        <div className="avatar-badge">{currentAccount.initials}</div>
        <div className="profile-button-copy">
          <strong>{brandConfig.name}</strong>
          <span>{currentAccount.email}</span>
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
              <strong>{currentAccount.email}</strong>
            </div>
            <motion.button
              className="profile-dropdown-row"
              onClick={() => {
                setOpen(false)
                navigate('/settings')
              }}
              type="button"
              whileTap={{ scale: 0.985 }}
            >
              <span className="profile-dropdown-row-copy">
                <SettingsIcon size={15} />
                <span>Settings</span>
              </span>
              <ChevronIcon direction="right" size={14} />
            </motion.button>
            <motion.button
              className="profile-dropdown-row profile-dropdown-row--danger"
              onClick={() => {
                setOpen(false)
                setConfirmingSignOut(true)
              }}
              type="button"
              whileTap={{ scale: 0.985 }}
            >
              <span className="profile-dropdown-row-copy">
                <span>Sign out</span>
              </span>
              <ChevronIcon direction="right" size={14} />
            </motion.button>
            <div className="profile-dropdown-version">
              <span>Version</span>
              <strong>v{packageMeta.version}</strong>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <SignOutConfirmModal
        onClose={() => setConfirmingSignOut(false)}
        onConfirm={handleSignOut}
        open={confirmingSignOut}
      />
    </div>
  )
}
