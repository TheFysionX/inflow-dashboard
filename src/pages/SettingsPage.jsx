import { useMemo, useState } from 'react'
import AnimatedPage from '../components/ui/AnimatedPage'
import ChartPanel from '../components/ui/ChartPanel'
import OptionSelect from '../components/ui/OptionSelect'
import SignOutConfirmModal from '../components/ui/SignOutConfirmModal'
import StatusPill from '../components/ui/StatusPill'
import {
  useDashboardActions,
  useDashboardAuth,
  useDashboardDataset,
  useDashboardPreferences,
  useDashboardSelection,
} from '../context/AppContext'
import { getOverviewModel, getSettingsModel } from '../data/selectors'

export default function SettingsPage() {
  const { currentAccount } = useDashboardAuth()
  const { dataset, clients } = useDashboardDataset()
  const { activeClientId, rangeSelection } = useDashboardSelection()
  const {
    defaultLandingPath,
    defaultRangePreset,
    numberFormat,
    overviewMetricSlots,
    overviewUseCompactNumbers,
    overviewWidgetSlots,
  } = useDashboardPreferences()
  const {
    logout,
    resetOverviewMetricSlots,
    resetOverviewWidgetSlots,
    setDefaultLandingPath,
    setDefaultRangePreset,
    setOverviewMetricSlot,
    setOverviewUseCompactNumbers,
    setOverviewWidgetSlot,
  } = useDashboardActions()
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)

  const overview = useMemo(
    () => getOverviewModel(dataset, activeClientId, rangeSelection, overviewMetricSlots),
    [activeClientId, dataset, overviewMetricSlots, rangeSelection],
  )

  const settings = useMemo(
    () =>
      getSettingsModel(
        {
          clients,
          currentAccount,
          dataset,
          defaultLandingPath,
          defaultRangePreset,
          numberFormat,
          overviewMetricSlots,
          overviewUseCompactNumbers,
          overviewWidgetSlots,
        },
          activeClientId,
          overview.availableMetrics,
        ),
    [
      activeClientId,
      clients,
      currentAccount,
      dataset,
      defaultLandingPath,
      defaultRangePreset,
      numberFormat,
      overview.availableMetrics,
      overviewMetricSlots,
      overviewUseCompactNumbers,
      overviewWidgetSlots,
    ],
  )

  function handleSignOut() {
    logout()
  }

  return (
    <>
      <AnimatedPage className="page-stack">
        <section className="overview-grid overview-grid--dynamic overview-grid--equal-height">
        <ChartPanel
          badge="Workspace"
          className="overview-widget overview-widget--wide"
          index={0}
          sectionId="settings-identity"
          style={{ '--overview-span': 5 }}
          subtitle="Brand and support details"
          title="Workspace identity"
        >
          <div className="settings-brand-preview">
            <div className="settings-brand-mark">{settings.workspaceIdentity.initials}</div>
            <div className="settings-brand-copy">
              <h4>{settings.workspaceIdentity.workspaceName}</h4>
              <p>{settings.workspaceIdentity.subtitle}</p>
            </div>
          </div>

          <div className="detail-card-grid">
            <div className="detail-card">
              <span>Brand</span>
              <strong>{settings.workspaceIdentity.brandName}</strong>
            </div>
            <div className="detail-card">
              <span>Support email</span>
              <strong>{settings.workspaceIdentity.supportEmail}</strong>
            </div>
            <div className="detail-card">
              <span>Timezone</span>
              <strong>{settings.workspaceIdentity.timezone}</strong>
            </div>
          </div>
        </ChartPanel>

        <ChartPanel
          badge="Defaults"
          className="overview-widget overview-widget--wide"
          index={1}
          sectionId="settings-defaults"
          style={{ '--overview-span': 7 }}
          subtitle="What the workspace opens to"
          title="Dashboard defaults"
        >
          <div className="overview-customizer-grid">
            <div className="overview-customizer-field">
              <span>Default landing page</span>
              <OptionSelect
                onChange={setDefaultLandingPath}
                options={settings.dashboardDefaults.landingOptions}
                value={settings.dashboardDefaults.landingPath}
              />
            </div>

            <div className="overview-customizer-field">
              <span>Default date range</span>
              <OptionSelect
                onChange={setDefaultRangePreset}
                options={settings.dashboardDefaults.rangeOptions}
                value={settings.dashboardDefaults.rangePreset}
              />
            </div>
          </div>

          <p className="settings-panel-note">
            These defaults shape where the dashboard lands first and which time window loads by default.
          </p>
        </ChartPanel>
        </section>

        <section className="overview-grid overview-grid--dynamic">
        <ChartPanel
          badge={`${settings.overviewDefaults.metricSlots.length} KPI slots`}
          className="overview-widget overview-widget--wide"
          index={0}
          sectionId="settings-overview-defaults"
          style={{ '--overview-span': 12 }}
          subtitle="Homepage defaults"
          title="Overview defaults"
        >
          <div className="settings-section-actions">
            <button
              className="ghost-button button-small"
              onClick={resetOverviewMetricSlots}
              type="button"
            >
              Reset KPI defaults
            </button>
            <button
              className="ghost-button button-small"
              onClick={resetOverviewWidgetSlots}
              type="button"
            >
              Reset graph defaults
            </button>
          </div>

          <p className="settings-panel-note">
            Homepage KPI and graph personalization now lives here so the Overview page stays focused on live operations.
          </p>

          <div className="overview-customizer-section">
            <h4>KPI slots</h4>
            <div className="overview-customizer-grid">
              {settings.overviewDefaults.metricSlots.map((metricKey, index) => (
                <div className="overview-customizer-field" key={`settings-metric-${index}`}>
                  <span>Slot {index + 1}</span>
                  <OptionSelect
                    onChange={(nextValue) => setOverviewMetricSlot(index, nextValue)}
                    options={settings.overviewDefaults.metricOptions}
                    value={metricKey}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="overview-customizer-section">
            <h4>Graph and widget slots</h4>
            <div className="overview-customizer-grid">
              {settings.overviewDefaults.widgetSlots.map((widgetKey, index) => (
                <div className="overview-customizer-field" key={`settings-widget-${index}`}>
                  <span>Widget {index + 1}</span>
                  <OptionSelect
                    onChange={(nextValue) => setOverviewWidgetSlot(index, nextValue)}
                    options={settings.overviewDefaults.widgetOptions[index]}
                    value={widgetKey}
                  />
                </div>
              ))}
            </div>
          </div>
        </ChartPanel>
        </section>

        <section className="overview-grid overview-grid--dynamic">
        <ChartPanel
          badge={settings.freshness.shortLabel}
          className="overview-widget overview-widget--wide"
          index={2}
          sectionId="settings-metric-definitions"
          style={{ '--overview-span': 12 }}
          subtitle="Reference copy"
          title="Metric definitions"
        >
          <div className="settings-definition-groups">
            {settings.metricDefinitions.map((group) => (
              <div className="settings-definition-group" key={group.pageLabel}>
                <div className="settings-definition-header">
                  <h4>{group.pageLabel}</h4>
                </div>
                <div className="detail-card-grid settings-definition-grid">
                  {group.metrics.map((metric) => (
                    <div className="detail-card" key={metric.key ?? metric.value}>
                      <span>{metric.label}</span>
                      <strong>{metric.detail ?? 'Available as a configurable dashboard metric.'}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {overview.overviewTrendMetricGroups?.map((group) => (
              <div className="settings-definition-group" key={`overview-graph-${group.key}`}>
                <div className="settings-definition-header">
                  <h4>{group.label}</h4>
                </div>
                <div className="detail-card-grid settings-definition-grid">
                  {group.metrics.map((metric) => (
                    <div className="detail-card" key={metric.key}>
                      <span>{metric.label}</span>
                      <strong>{metric.detail ?? 'Available as a configurable homepage graph value.'}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ChartPanel>
        </section>

        <section className="overview-grid overview-grid--dynamic overview-grid--equal-height">
        <ChartPanel
          badge={settings.displayPreferences.useCompactNumbers ? 'Compact' : 'Full'}
          className="overview-widget overview-widget--wide"
          index={0}
          sectionId="settings-display"
          style={{ '--overview-span': 6 }}
          subtitle="Sticky UI preference"
          title="Display preferences"
        >
          <div className="settings-display-preferences">
            <button
              aria-label={
                overviewUseCompactNumbers
                  ? 'Switch to full number format'
                  : 'Switch to compact number format'
              }
              aria-pressed={overviewUseCompactNumbers}
              className={`overview-display-toggle-button ${
                overviewUseCompactNumbers ? 'is-compact' : 'is-full'
              }`}
              onClick={() => setOverviewUseCompactNumbers(!overviewUseCompactNumbers)}
              type="button"
            >
              <span>1K</span>
              <span>1,000</span>
            </button>

            <div className="settings-panel-copy">
              <strong>Number formatting</strong>
              <p>
                Choose whether homepage KPIs and compatible dashboard metrics default to compact numbers or full values.
              </p>
            </div>
          </div>
        </ChartPanel>

        <ChartPanel
          badge="Session"
          className="overview-widget overview-widget--wide"
          index={1}
          sectionId="settings-account"
          style={{ '--overview-span': 6 }}
          subtitle="Current demo account"
          title="Session and account"
        >
          <div className="settings-account-card">
            <div>
              <p className="sidebar-caption">Signed in as</p>
              <h4>{settings.sessionAccount.email}</h4>
              <p>{settings.sessionAccount.brandLabel}</p>
            </div>
            <StatusPill tone="info">Demo access</StatusPill>
          </div>

          <div className="settings-section-actions settings-section-actions--start settings-section-actions--account">
            <button
              className="danger-button button-small"
              onClick={() => setConfirmingSignOut(true)}
              type="button"
            >
              Sign out
            </button>
          </div>
        </ChartPanel>
        </section>
      </AnimatedPage>
      <SignOutConfirmModal
        onClose={() => setConfirmingSignOut(false)}
        onConfirm={handleSignOut}
        open={confirmingSignOut}
      />
    </>
  )
}
