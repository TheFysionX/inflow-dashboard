export const OVERVIEW_REFERENCE_NOW = '2026-03-31T18:00:00.000Z'
export const OVERVIEW_DATA_CUTOFF = '2026-03-31'
export const OVERVIEW_UPCOMING_CALL_SLOTS = [
  '2026-04-01T16:30:00.000Z',
  '2026-04-02T20:15:00.000Z',
  '2026-04-03T15:45:00.000Z',
  '2026-04-05T18:00:00.000Z',
  '2026-04-06T22:00:00.000Z',
  '2026-04-08T17:30:00.000Z',
  '2026-04-10T19:15:00.000Z',
  '2026-04-13T21:00:00.000Z',
]

export const overviewSupplement = {
  leadOverrides: {
    L09790: {
      callTime: '2026-04-01T15:30:00.000Z',
    },
    L09850: {
      callTime: '2026-04-02T17:00:00.000Z',
    },
    L09861: {
      callTime: '2026-04-03T18:30:00.000Z',
    },
    L09957: {
      callTime: '2026-04-04T16:30:00.000Z',
    },
    L09971: {
      callTime: '2026-04-07T20:00:00.000Z',
      confirmedTime: '2026-03-31T14:20:00.000Z',
    },
    L09981: {
      callTime: '2026-04-09T14:00:00.000Z',
    },
    L09991: {
      callTime: '2026-04-11T19:30:00.000Z',
    },
    L09992: {
      callTime: '2026-04-13T20:30:00.000Z',
    },
    L10118: {
      enteredStageAt: '2026-03-26T15:00:00.000Z',
      lastActivityAt: '2026-03-26T18:30:00.000Z',
      attentionNote: 'No reply for 5 days',
    },
    L10129: {
      enteredStageAt: '2026-03-27T17:00:00.000Z',
      lastActivityAt: '2026-03-27T16:15:00.000Z',
      attentionNote: 'Qualification follow-up is overdue',
    },
    L10225: {
      enteredStageAt: '2026-03-28T17:30:00.000Z',
      lastActivityAt: '2026-03-28T19:10:00.000Z',
      attentionNote: 'Opening follow-up is overdue',
    },
    L10266: {
      enteredStageAt: '2026-03-29T16:20:00.000Z',
      lastActivityAt: '2026-03-29T22:00:00.000Z',
      attentionNote: 'Current-stage lead needs a fit check',
    },
    L10272: {
      enteredStageAt: '2026-03-30T18:00:00.000Z',
      lastActivityAt: '2026-03-30T20:45:00.000Z',
      attentionNote: 'Desired-stage lead has stalled on next step',
    },
    L10335: {
      enteredStageAt: '2026-03-31T14:30:00.000Z',
      lastActivityAt: '2026-03-30T21:00:00.000Z',
      attentionNote: 'Waiting on response after call options were sent',
    },
    L10366: {
      enteredStageAt: '2026-03-31T16:10:00.000Z',
      lastActivityAt: '2026-03-31T10:20:00.000Z',
      attentionNote: 'Fresh opening lead needs a first follow-up',
    },
    L10373: {
      enteredStageAt: '2026-03-31T12:40:00.000Z',
      lastActivityAt: '2026-03-31T01:35:00.000Z',
      attentionNote: 'Desired-stage follow-up is due',
    },
  },
}

export function getOverviewLeadOverride(leadId) {
  return overviewSupplement.leadOverrides[leadId] ?? null
}

export function getOverviewUpcomingCallSlot(index) {
  return OVERVIEW_UPCOMING_CALL_SLOTS[index] ?? null
}
