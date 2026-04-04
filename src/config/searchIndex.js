import { navigationItems } from './navigation'

const pageByPath = Object.fromEntries(
  navigationItems.map((item) => [item.path, item]),
)

function normalize(value = '') {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tokenize(value = '') {
  return normalize(value)
    .split(' ')
    .filter(Boolean)
}

function createEntry({
  id,
  title,
  path,
  sectionId = '',
  description = '',
  keywords = [],
  type = 'section',
}) {
  const page = pageByPath[path] ?? pageByPath['/overview']

  return {
    id,
    title,
    path,
    sectionId,
    description,
    keywords,
    type,
    pageLabel: page?.label ?? 'Dashboard',
    pageIcon: page?.icon ?? 'overview',
  }
}

const pageEntries = navigationItems.map((item) =>
  createEntry({
    id: `page-${item.path.slice(1)}`,
    title: item.label,
    path: item.path,
    description: item.summary,
    keywords: [item.phase, item.summary, item.label],
    type: 'page',
  }),
)

const sectionEntries = [
  createEntry({
    id: 'overview-summary',
    title: 'Overview summary',
    path: '/overview',
    sectionId: 'overview-summary',
    description: 'Mission-control summary and weekly headline',
    keywords: ['mission control', 'weekly in inflow', 'headline', 'summary'],
  }),
  createEntry({
    id: 'overview-kpis',
    title: 'Overview KPIs',
    path: '/overview',
    sectionId: 'overview-kpis',
    description: 'Homepage KPI row',
    keywords: ['kpis', 'metrics', 'homepage numbers', 'summary cards'],
  }),
  createEntry({
    id: 'pipeline-summary',
    title: 'Pipeline summary',
    path: '/pipeline',
    sectionId: 'pipeline-summary',
    description: 'Pipeline headline statistics',
    keywords: ['pipeline leads', 'in desired stage', 'needs attention', 'avg response gap'],
  }),
  createEntry({
    id: 'pipeline-filters',
    title: 'Pipeline filters',
    path: '/pipeline',
    sectionId: 'pipeline-filters',
    description: 'Stage, qualification, objection, and booking filters',
    keywords: ['all stages', 'all qualification', 'all objections', 'all booking'],
  }),
  createEntry({
    id: 'pipeline-stage-distribution',
    title: 'Stage distribution',
    path: '/pipeline',
    sectionId: 'pipeline-stage-distribution',
    description: 'Where visible leads are currently sitting',
    keywords: ['stage distribution', 'pipeline stages'],
  }),
  createEntry({
    id: 'pipeline-funnel',
    title: 'Lead journey funnel',
    path: '/pipeline',
    sectionId: 'pipeline-funnel',
    description: 'Pipeline progression funnel',
    keywords: ['lead journey', 'pipeline progression', 'funnel'],
  }),
  createEntry({
    id: 'pipeline-response-gap',
    title: 'Response gap by stage',
    path: '/pipeline',
    sectionId: 'pipeline-response-gap',
    description: 'Average latency before the next touch',
    keywords: ['response gap', 'reply latency', 'time in stage'],
  }),
  createEntry({
    id: 'pipeline-completion',
    title: 'Stage completion path',
    path: '/pipeline',
    sectionId: 'pipeline-completion',
    description: 'Step by step advancement',
    keywords: ['completion path', 'advancement', 'stage completion'],
  }),
  createEntry({
    id: 'leads-summary',
    title: 'Leads summary',
    path: '/leads',
    sectionId: 'leads-summary',
    description: 'Lead database headline metrics',
    keywords: ['leads in view', 'qualified', 'booking intent', 'needs attention'],
  }),
  createEntry({
    id: 'leads-quality',
    title: 'Lead quality mix',
    path: '/leads',
    sectionId: 'leads-quality-mix',
    description: 'Lead qualification mix',
    keywords: ['lead quality', 'qualification breakdown', 'qualified leads', 'unqualified leads'],
  }),
  createEntry({
    id: 'leads-goal',
    title: 'Goal type mix',
    path: '/leads',
    sectionId: 'leads-goal-mix',
    description: 'What people want',
    keywords: ['goal type', 'goals'],
  }),
  createEntry({
    id: 'leads-experience',
    title: 'Experience mix',
    path: '/leads',
    sectionId: 'leads-experience-mix',
    description: 'Lead maturity',
    keywords: ['experience', 'maturity'],
  }),
  createEntry({
    id: 'leads-commitment',
    title: 'Source bucket mix',
    path: '/leads',
    sectionId: 'leads-source-bucket-mix',
    description: 'Where leads are coming from',
    keywords: ['source bucket', 'lead sources', 'paid', 'organic', 'referral', 'outbound'],
  }),
  createEntry({
    id: 'leads-database',
    title: 'Lead database',
    path: '/leads',
    sectionId: 'leads-database',
    description: 'CRM table and lead filters',
    keywords: ['crm', 'lead table', 'lead filters'],
  }),
  createEntry({
    id: 'conversations-summary',
    title: 'Conversations summary',
    path: '/conversations',
    sectionId: 'conversations-summary',
    description: 'Conversation KPI row',
    keywords: ['active threads', 'unhealthy threads', 'avg first reply', 'avg reply gap', 'thread close rate'],
  }),
  createEntry({
    id: 'conversations-volume',
    title: 'Conversation volume',
    path: '/conversations',
    sectionId: 'conversations-volume',
    description: 'Inbound vs outbound activity',
    keywords: ['inbound activity', 'outbound activity', 'message volume'],
  }),
  createEntry({
    id: 'conversations-outcomes',
    title: 'Thread outcomes',
    path: '/conversations',
    sectionId: 'conversations-outcomes',
    description: 'How visible threads resolve',
    keywords: ['thread outcomes', 'booked', 'closed', 'stalled', 'active'],
  }),
  createEntry({
    id: 'conversations-close-reasons',
    title: 'Thread close reasons',
    path: '/conversations',
    sectionId: 'conversations-close-reasons',
    description: 'Why threads stop or resolve',
    keywords: ['close reasons', 'drop reasons'],
  }),
  createEntry({
    id: 'conversations-workspace',
    title: 'Recent threads',
    path: '/conversations',
    sectionId: 'conversations-workspace',
    description: 'Conversation queue and detail workspace',
    keywords: ['conversation queue', 'recent threads', 'conversation detail'],
  }),
  createEntry({
    id: 'objections-summary',
    title: 'Objections summary',
    path: '/objections',
    sectionId: 'objections-summary',
    description: 'Top blocker KPI row',
    keywords: ['leads with objections', 'recovery rate', 'drop off rate', 'top blocker share'],
  }),
  createEntry({
    id: 'objections-trend',
    title: 'Objection trend over time',
    path: '/objections',
    sectionId: 'objections-trend',
    description: 'Explicit blocker volume across the selected range',
    keywords: ['objection trend', 'blocker trend'],
  }),
  createEntry({
    id: 'objections-distribution',
    title: 'Objection distribution',
    path: '/objections',
    sectionId: 'objections-distribution',
    description: 'Which blockers show up most often',
    keywords: ['blockers', 'trust', 'cost', 'time', 'confidence', 'risk'],
  }),
  createEntry({
    id: 'objections-dropoff',
    title: 'Drop-off by stage',
    path: '/objections',
    sectionId: 'objections-dropoff',
    description: 'Where conversations slow down after resistance appears',
    keywords: ['drop off', 'drop-off stage'],
  }),
  createEntry({
    id: 'objections-recovery',
    title: 'Objection-to-booking recovery',
    path: '/objections',
    sectionId: 'objections-recovery',
    description: 'Which blockers still convert into scheduling',
    keywords: ['recovery', 'objection recovery'],
  }),
  createEntry({
    id: 'bookings-summary',
    title: 'Bookings summary',
    path: '/bookings',
    sectionId: 'bookings-summary',
    description: 'Booking KPI row',
    keywords: ['confirmed calls', 'booking rate', 'show rate', 'at-risk bookings'],
  }),
  createEntry({
    id: 'bookings-funnel',
    title: 'Booking funnel',
    path: '/bookings',
    sectionId: 'bookings-funnel',
    description: 'Proposed slots through attended calls',
    keywords: ['proposed', 'confirmed', 'attended', 'booking funnel'],
  }),
  createEntry({
    id: 'bookings-confirmed-trend',
    title: 'Confirmed calls over time',
    path: '/bookings',
    sectionId: 'bookings-confirmed-trend',
    description: 'Confirmed booking volume',
    keywords: ['confirmed calls trend', 'booking trend'],
  }),
  createEntry({
    id: 'bookings-attendance',
    title: 'No-show vs attended',
    path: '/bookings',
    sectionId: 'bookings-attendance',
    description: 'What happened to completed bookings',
    keywords: ['attendance', 'no show', 'attended'],
  }),
  createEntry({
    id: 'bookings-upcoming',
    title: 'Upcoming bookings',
    path: '/bookings',
    sectionId: 'bookings-upcoming',
    description: 'Calls already on the calendar',
    keywords: ['upcoming calls', 'scheduled calls'],
  }),
  createEntry({
    id: 'bookings-at-risk',
    title: 'At-risk bookings',
    path: '/bookings',
    sectionId: 'bookings-at-risk',
    description: 'Bookings that need intervention',
    keywords: ['at risk', 'needs intervention'],
  }),
  createEntry({
    id: 'bookings-friction',
    title: 'Scheduling friction summary',
    path: '/bookings',
    sectionId: 'bookings-friction',
    description: 'What is slowing confirmations right now',
    keywords: ['friction', 'scheduling blockers'],
  }),
  createEntry({
    id: 'performance-summary',
    title: 'Performance summary',
    path: '/performance',
    sectionId: 'performance-summary',
    description: 'QA KPI row',
    keywords: ['avg reply quality', 'qa coverage', 'approval rate', 'guardrail touch rate'],
  }),
  createEntry({
    id: 'performance-verdict',
    title: 'Verdict distribution',
    path: '/performance',
    sectionId: 'performance-verdict',
    description: 'How reviewed replies resolved',
    keywords: ['verdicts', 'review verdicts'],
  }),
  createEntry({
    id: 'performance-review-trend',
    title: 'Review score trend',
    path: '/performance',
    sectionId: 'performance-review-trend',
    description: 'Weighted review quality',
    keywords: ['reply quality trend', 'review trend'],
  }),
  createEntry({
    id: 'performance-quality-stage',
    title: 'Quality by stage',
    path: '/performance',
    sectionId: 'performance-quality-stage',
    description: 'Where reply quality is strongest right now',
    keywords: ['stage quality'],
  }),
  createEntry({
    id: 'performance-pressure',
    title: 'Guardrail pressure snapshot',
    path: '/performance',
    sectionId: 'performance-pressure',
    description: 'Where reviewed load is producing intervention pressure',
    keywords: ['guardrail pressure', 'guardrail touches', 'review pressure'],
  }),
  createEntry({
    id: 'performance-coaching',
    title: 'Coaching queue',
    path: '/performance',
    sectionId: 'performance-coaching',
    description: 'Reviewed threads needing a second pass',
    keywords: ['needs coaching', 'coaching'],
  }),
  createEntry({
    id: 'settings-identity',
    title: 'Workspace identity',
    path: '/settings',
    sectionId: 'settings-identity',
    description: 'Brand and support details',
    keywords: ['workspace', 'support email', 'timezone'],
  }),
  createEntry({
    id: 'settings-defaults',
    title: 'Dashboard defaults',
    path: '/settings',
    sectionId: 'settings-defaults',
    description: 'Default landing page and date range',
    keywords: ['default landing page', 'default range'],
  }),
  createEntry({
    id: 'settings-overview-defaults',
    title: 'Overview defaults',
    path: '/settings',
    sectionId: 'settings-overview-defaults',
    description: 'Homepage KPI and graph defaults',
    keywords: ['overview defaults', 'homepage defaults', 'default kpis', 'default widgets'],
  }),
  createEntry({
    id: 'settings-metric-definitions',
    title: 'Metric definitions',
    path: '/settings',
    sectionId: 'settings-metric-definitions',
    description: 'Definitions for configurable dashboard metrics',
    keywords: ['metric definitions', 'metric glossary', 'kpi definitions'],
  }),
  createEntry({
    id: 'settings-display',
    title: 'Display preferences',
    path: '/settings',
    sectionId: 'settings-display',
    description: 'Number formatting preference',
    keywords: ['number format', 'compact numbers', 'full numbers'],
  }),
  createEntry({
    id: 'settings-account',
    title: 'Session and account',
    path: '/settings',
    sectionId: 'settings-account',
    description: 'Current demo account and sign out',
    keywords: ['account', 'sign out', 'session'],
  }),
]

const metricEntries = [
  ['Total Leads', '/leads', 'leads-summary', ['lead count', 'new leads']],
  ['Pipeline Leads', '/pipeline', 'pipeline-summary', ['pipeline lead count']],
  ['In Desired Stage', '/pipeline', 'pipeline-summary', ['desired stage']],
  ['Avg Response Gap', '/pipeline', 'pipeline-summary', ['response gap', 'latency']],
  ['Open Threads', '/conversations', 'conversations-summary', ['open conversations', 'threads']],
  ['Qualified Leads', '/leads', 'leads-summary', ['qualified']],
  ['Unqualified Leads', '/leads', 'leads-summary', ['unqualified']],
  ['Booking Intent', '/leads', 'leads-database', ['intent yes', 'intent maybe']],
  ['Confirmed Calls', '/bookings', 'bookings-summary', ['booked calls']],
  ['Conversion Rate', '/overview', 'overview-kpis', ['conversion']],
  ['Reply Quality', '/performance', 'performance-summary', ['avg reply quality']],
  ['First Reply Time', '/conversations', 'conversations-summary', ['avg first reply']],
  ['Reply Gap', '/conversations', 'conversations-summary', ['avg reply gap', 'reply latency']],
  ['Unhealthy Threads', '/conversations', 'conversations-summary', ['needs review', 'guardrail touched']],
  ['Thread Close Rate', '/conversations', 'conversations-summary', ['close rate']],
  ['Needs Attention', '/pipeline', 'pipeline-summary', ['attention']],
  ['Upcoming Calls', '/bookings', 'bookings-upcoming', ['upcoming bookings']],
  ['Objection Rate', '/objections', 'objections-summary', ['blocker rate']],
  ['Objection Recovery', '/objections', 'objections-recovery', ['recovery rate']],
  ['Drop-off Rate', '/objections', 'objections-dropoff', ['drop off rate']],
  ['Confirmed Bookings', '/bookings', 'bookings-summary', ['confirmed bookings']],
  ['At-risk Bookings', '/bookings', 'bookings-at-risk', ['at risk bookings']],
  ['Show Rate', '/bookings', 'bookings-summary', ['attendance rate']],
  ['No-show Rate', '/bookings', 'bookings-summary', ['no show rate']],
  ['QA Coverage', '/performance', 'performance-summary', ['qa']],
  ['Approval Rate', '/performance', 'performance-summary', ['approvals']],
  ['Guardrail Touch Rate', '/performance', 'performance-pressure', ['guardrail']],
  ['Needs Coaching', '/performance', 'performance-coaching', ['coaching queue']],
].map(([title, path, sectionId, keywords]) =>
  createEntry({
    id: `metric-${normalize(title).replace(/\s+/g, '-')}`,
    title,
    path,
    sectionId,
    description: 'Quick jump to the most relevant dashboard surface for this metric',
    keywords,
    type: 'metric',
  }),
)

const SEARCH_ENTRIES = [...pageEntries, ...sectionEntries, ...metricEntries]

export const quickSearchEntries = [
  pageEntries.find((item) => item.path === '/overview'),
  pageEntries.find((item) => item.path === '/pipeline'),
  pageEntries.find((item) => item.path === '/conversations'),
  pageEntries.find((item) => item.path === '/bookings'),
  pageEntries.find((item) => item.path === '/objections'),
  pageEntries.find((item) => item.path === '/leads'),
  pageEntries.find((item) => item.path === '/settings'),
].filter(Boolean)

function scoreFieldPhrase(field, normalizedQuery, startScore, includesScore, exactScore) {
  if (!field) {
    return 0
  }

  if (field === normalizedQuery) {
    return exactScore
  }

  if (field.startsWith(normalizedQuery)) {
    return startScore
  }

  if (normalizedQuery.length >= 4 && field.includes(normalizedQuery)) {
    return includesScore
  }

  return 0
}

function scoreTokenMatch(tokens, term, exactScore, prefixScore, includesScore) {
  let best = 0

  tokens.forEach((token) => {
    if (token === term) {
      best = Math.max(best, exactScore)
      return
    }

    if (token.startsWith(term)) {
      best = Math.max(best, prefixScore)
      return
    }

    if (term.length >= 4 && token.includes(term)) {
      best = Math.max(best, includesScore)
    }
  })

  return best
}

export function searchDashboard(query, limit = 8) {
  const normalizedQuery = normalize(query)

  if (!normalizedQuery) {
    return quickSearchEntries.slice(0, limit)
  }

  const terms = normalizedQuery.split(' ').filter(Boolean)

  return SEARCH_ENTRIES.map((entry) => {
    const title = normalize(entry.title)
    const description = normalize(entry.description)
    const pageLabel = normalize(entry.pageLabel)
    const keywordFields = entry.keywords.map((keyword) => normalize(keyword))
    const titleTokens = tokenize(entry.title)
    const descriptionTokens = tokenize(entry.description)
    const pageTokens = tokenize(entry.pageLabel)
    const keywordTokens = entry.keywords.flatMap((keyword) => tokenize(keyword))
    let score = 0
    let matchedTerms = 0
    let strongMatchedTerms = 0

    score += scoreFieldPhrase(title, normalizedQuery, 180, 128, 240)
    score += scoreFieldPhrase(description, normalizedQuery, 92, 56, 120)
    score += scoreFieldPhrase(pageLabel, normalizedQuery, 88, 52, 116)

    keywordFields.forEach((keyword) => {
      score += scoreFieldPhrase(keyword, normalizedQuery, 132, 84, 180)
    })

    terms.forEach((term) => {
      const strongTermScore = Math.max(
        scoreTokenMatch(titleTokens, term, 84, 64, 0),
        scoreTokenMatch(keywordTokens, term, 72, 56, 0),
        scoreTokenMatch(pageTokens, term, 56, 42, 0),
      )
      const weakTermScore = scoreTokenMatch(descriptionTokens, term, 32, 24, 0)
      const termScore = Math.max(strongTermScore, weakTermScore)

      if (termScore > 0) {
        matchedTerms += 1
        score += termScore
      }

      if (strongTermScore > 0) {
        strongMatchedTerms += 1
      }
    })

    const minimumMatchedTerms = terms.length > 1 ? Math.ceil(terms.length * 0.6) : 1

    if (
      (matchedTerms < minimumMatchedTerms || strongMatchedTerms < minimumMatchedTerms) &&
      score < 128
    ) {
      score = 0
    }

    if (entry.type === 'page' && score > 0) {
      score += 4
    }

    return {
      ...entry,
      score,
    }
  })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      if (left.type !== right.type) {
        return left.type === 'page' ? -1 : 1
      }

      return left.title.localeCompare(right.title)
    })
    .slice(0, limit)
}
