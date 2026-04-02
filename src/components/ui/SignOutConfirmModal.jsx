import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function SignOutConfirmModal({
  open,
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (!open) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  return createPortal(
    <AnimatePresence initial={false}>
      <motion.div
        animate={{ opacity: 1 }}
        className="modal-overlay"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={onClose}
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
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="danger-button button-small"
              onClick={onConfirm}
              type="button"
            >
              Sign out
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
