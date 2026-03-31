export const MOCK_MONTHLY_PROFILES = [
  {
    monthId: '2025-01',
    leadCount: 28,
    qualificationRate: 0.54,
    unclearRate: 0.18,
    bookingRate: 0.035,
    futureBookingRate: 0,
    objectionRate: 0.34,
    maybeIntentRate: 0.18,
  },
  {
    monthId: '2025-02',
    leadCount: 30,
    qualificationRate: 0.55,
    unclearRate: 0.18,
    bookingRate: 0.037,
    futureBookingRate: 0,
    objectionRate: 0.34,
    maybeIntentRate: 0.18,
  },
  {
    monthId: '2025-03',
    leadCount: 32,
    qualificationRate: 0.56,
    unclearRate: 0.18,
    bookingRate: 0.04,
    futureBookingRate: 0,
    objectionRate: 0.335,
    maybeIntentRate: 0.18,
  },
  {
    monthId: '2025-04',
    leadCount: 35,
    qualificationRate: 0.57,
    unclearRate: 0.18,
    bookingRate: 0.043,
    futureBookingRate: 0,
    objectionRate: 0.33,
    maybeIntentRate: 0.19,
  },
  {
    monthId: '2025-05',
    leadCount: 38,
    qualificationRate: 0.58,
    unclearRate: 0.17,
    bookingRate: 0.046,
    futureBookingRate: 0,
    objectionRate: 0.325,
    maybeIntentRate: 0.19,
  },
  {
    monthId: '2025-06',
    leadCount: 42,
    qualificationRate: 0.59,
    unclearRate: 0.17,
    bookingRate: 0.05,
    futureBookingRate: 0,
    objectionRate: 0.32,
    maybeIntentRate: 0.19,
  },
  {
    monthId: '2025-07',
    leadCount: 46,
    qualificationRate: 0.6,
    unclearRate: 0.17,
    bookingRate: 0.053,
    futureBookingRate: 0,
    objectionRate: 0.315,
    maybeIntentRate: 0.19,
  },
  {
    monthId: '2025-08',
    leadCount: 50,
    qualificationRate: 0.61,
    unclearRate: 0.16,
    bookingRate: 0.056,
    futureBookingRate: 0,
    objectionRate: 0.31,
    maybeIntentRate: 0.2,
  },
  {
    monthId: '2025-09',
    leadCount: 54,
    qualificationRate: 0.62,
    unclearRate: 0.16,
    bookingRate: 0.059,
    futureBookingRate: 0,
    objectionRate: 0.305,
    maybeIntentRate: 0.2,
  },
  {
    monthId: '2025-10',
    leadCount: 58,
    qualificationRate: 0.63,
    unclearRate: 0.16,
    bookingRate: 0.061,
    futureBookingRate: 0,
    objectionRate: 0.3,
    maybeIntentRate: 0.2,
  },
  {
    monthId: '2025-11',
    leadCount: 62,
    qualificationRate: 0.64,
    unclearRate: 0.15,
    bookingRate: 0.063,
    futureBookingRate: 0,
    objectionRate: 0.295,
    maybeIntentRate: 0.205,
  },
  {
    monthId: '2025-12',
    leadCount: 66,
    qualificationRate: 0.65,
    unclearRate: 0.15,
    bookingRate: 0.066,
    futureBookingRate: 0,
    objectionRate: 0.29,
    maybeIntentRate: 0.205,
  },
  {
    monthId: '2026-01',
    leadCount: 72,
    qualificationRate: 0.67,
    unclearRate: 0.145,
    bookingRate: 0.07,
    futureBookingRate: 0,
    objectionRate: 0.285,
    maybeIntentRate: 0.21,
  },
  {
    monthId: '2026-02',
    leadCount: 79,
    qualificationRate: 0.68,
    unclearRate: 0.14,
    bookingRate: 0.11,
    futureBookingRate: 0.038,
    objectionRate: 0.28,
    maybeIntentRate: 0.215,
  },
  {
    monthId: '2026-03',
    leadCount: 88,
    qualificationRate: 0.7,
    unclearRate: 0.13,
    bookingRate: 0.14,
    futureBookingRate: 0.06,
    objectionRate: 0.27,
    maybeIntentRate: 0.22,
  },
]

export const TOTAL_TIMELINE_LEADS_PER_CLIENT = MOCK_MONTHLY_PROFILES.reduce(
  (sum, profile) => sum + profile.leadCount,
  0,
)

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

export function getTimelineSlot(leadIndex) {
  let offset = leadIndex

  for (let index = 0; index < MOCK_MONTHLY_PROFILES.length; index += 1) {
    const profile = MOCK_MONTHLY_PROFILES[index]

    if (offset < profile.leadCount) {
      return {
        monthIndex: index,
        profile,
        positionInMonth: offset,
      }
    }

    offset -= profile.leadCount
  }

  return {
    monthIndex: MOCK_MONTHLY_PROFILES.length - 1,
    profile: MOCK_MONTHLY_PROFILES.at(-1),
    positionInMonth: 0,
  }
}

export function createTimelineDate({ monthId, positionInMonth, clientIndex }) {
  const [year, month] = monthId.split('-').map(Number)
  const daysInMonth = getDaysInMonth(year, month)
  const day = 1 + ((positionInMonth * 5 + clientIndex * 2 + month) % daysInMonth)
  const hour = 14 + ((positionInMonth * 3 + clientIndex + month) % 6)
  const minute = ((positionInMonth * 11) + (clientIndex * 7)) % 60

  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0))
}

export function createTimelineSeed({ monthIndex, positionInMonth, clientIndex }) {
  return (
    (((positionInMonth + 1) * 17) + (monthIndex * 11) + (clientIndex * 13)) %
    100
  ) / 100
}
