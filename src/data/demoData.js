import { OVERVIEW_DATA_CUTOFF, OVERVIEW_REFERENCE_NOW } from './overviewSupplement'
import { workbookSeed } from './workbookSeed'

export const REFERENCE_NOW = new Date(OVERVIEW_REFERENCE_NOW)
export const DEMO_DATA_START = new Date(
  `${workbookSeed.dailyFacts[0]?.date ?? '2025-01-01'}T00:00:00.000Z`,
)
export const STAGE_ORDER = ['opening', 'current', 'desired', 'objection', 'book']
export const STAGE_LABELS = {
  opening: 'Opening',
  current: 'Current',
  desired: 'Desired',
  objection: 'Objection',
  book: 'Book',
}

export function buildDemoDataset() {
  return {
    ...workbookSeed,
    referenceNow: OVERVIEW_REFERENCE_NOW,
    dailyFacts: (workbookSeed.dailyFacts ?? []).filter(
      (fact) => fact.date <= OVERVIEW_DATA_CUTOFF,
    ),
  }
}

export const demoDataset = buildDemoDataset()
