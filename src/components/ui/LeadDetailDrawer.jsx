import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon } from './Icons'
import StageBadge from './StageBadge'
import StatusPill from './StatusPill'
import TimelineList from './TimelineList'

export default function LeadDetailDrawer({ open, lead, onClose }) {
  return (
    <AnimatePresence initial={false}>
      {open && lead ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Close lead detail"
            className="lead-drawer-overlay"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />

          <motion.aside
            animate={{ opacity: 1, x: 0 }}
            className="lead-drawer surface-card"
            exit={{ opacity: 0, x: 24 }}
            initial={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="lead-drawer-header">
              <div>
                <p className="sidebar-caption">Lead detail</p>
                <h2>{lead.displayName}</h2>
                <p>{lead.source} · Created {lead.createdLabel}</p>
              </div>

              <button
                aria-label="Close lead detail"
                className="lead-drawer-close"
                onClick={onClose}
                type="button"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="lead-drawer-meta">
              <StageBadge tone={lead.stage.tone}>{lead.stage.label}</StageBadge>
              <StatusPill tone={lead.status.tone}>{lead.status.label}</StatusPill>
              <StatusPill tone={lead.qualification.tone}>{lead.qualification.label}</StatusPill>
              <StatusPill tone={lead.bookingStatus.tone}>{lead.bookingStatus.label}</StatusPill>
              <StatusPill tone={lead.priority.tone}>{lead.priority.label}</StatusPill>
            </div>

            <div className="lead-drawer-body">
              <section className="lead-drawer-section">
                <div className="detail-card-grid">
                  {lead.summaryCards.map((item) => (
                    <div className="detail-card" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="lead-drawer-section">
                <div className="lead-drawer-section-heading">
                  <p className="sidebar-caption">Lead facts</p>
                  <h3>Extracted summary</h3>
                </div>
                <div className="detail-facts-grid">
                  {lead.facts.map((fact) => (
                    <div className="detail-fact" key={fact.label}>
                      <span>{fact.label}</span>
                      <strong>{fact.value}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="lead-drawer-section">
                <div className="lead-drawer-section-heading">
                  <p className="sidebar-caption">Timeline</p>
                  <h3>Stage progression</h3>
                </div>
                <TimelineList items={lead.timeline} />
              </section>

              <section className="lead-drawer-section">
                <div className="lead-drawer-section-heading">
                  <p className="sidebar-caption">Conversation</p>
                  <h3>Transcript preview</h3>
                </div>
                <div className="transcript-stack">
                  {lead.transcriptPreview.map((entry) => (
                    <div
                      className={`transcript-bubble transcript-bubble--${entry.tone}`}
                      key={entry.id}
                    >
                      <span>{entry.sender}</span>
                      <p>{entry.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="lead-drawer-section">
                <div className="lead-drawer-section-heading">
                  <p className="sidebar-caption">Next move</p>
                  <h3>Recommended response</h3>
                </div>
                <div className="detail-callout">
                  <strong>Latest approved reply</strong>
                  <p>{lead.latestApprovedReply}</p>
                </div>
                <div className="detail-callout">
                  <strong>Next-step suggestion</strong>
                  <p>{lead.nextStepSuggestion}</p>
                </div>
              </section>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
