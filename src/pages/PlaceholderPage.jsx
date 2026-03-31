import AnimatedPage from '../components/ui/AnimatedPage'
import ChartPanel from '../components/ui/ChartPanel'
import StatusPill from '../components/ui/StatusPill'
import { navigationItems } from '../config/navigation'

export default function PlaceholderPage({ routePath }) {
  const currentPage =
    navigationItems.find((item) => item.path === routePath) ?? navigationItems[0]

  return (
    <AnimatedPage className="page-stack">
      <section className="surface-card placeholder-hero">
        <div>
          <p className="sidebar-caption">Next gate</p>
          <h2>{currentPage.label} is scaffolded and waiting for its focused build pass.</h2>
          <p>{currentPage.summary}</p>
        </div>
        <StatusPill tone="info">{currentPage.phase}</StatusPill>
      </section>

      <section className="placeholder-grid">
        <ChartPanel badge={currentPage.phase} subtitle="Why this matters" title="Planned depth">
          <p className="placeholder-copy">
            This screen is intentionally quiet for milestone 1 so we can lock the
            visual system, shell, and Overview behavior before branching into
            more detailed operational views.
          </p>
        </ChartPanel>

        <ChartPanel badge="Ready" subtitle="Foundation status" title="Already in place">
          <ul className="placeholder-list">
            <li>Shared shell, navigation, and account switching</li>
            <li>Seeded multi-tenant data contracts and selectors</li>
            <li>Reusable cards, pills, range controls, and chart wrappers</li>
          </ul>
        </ChartPanel>

        <ChartPanel badge="Next" subtitle="Build order" title="What lands here">
          <ul className="placeholder-list">
            <li>Page-specific charts, tables, or transcript surfaces</li>
            <li>New motion patterns only where the page needs them</li>
            <li>Client-safe storytelling without exposing internal routing fields</li>
          </ul>
        </ChartPanel>
      </section>
    </AnimatedPage>
  )
}
