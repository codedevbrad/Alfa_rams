import { useMemo } from 'react'
import { useEmailAnalytics } from '@renderer/systems/email/useEmailAnalytics'
import { useGmailSetup } from '@renderer/systems/email/useGmailSetup'
import { GmailConnectBanner } from '../dashboard/GmailConnectBanner'
import { AnalyticsRecentFulfilledTable } from './AnalyticsRecentFulfilledTable'
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards'
import { AnalyticsTopSendersTable } from './AnalyticsTopSendersTable'
import { AnalyticsVolumeBars } from './AnalyticsVolumeBars'
import { AnalyticsWorkflowBars } from './AnalyticsWorkflowBars'

export function EmailAnalyticsPanel(): React.JSX.Element {
  const setup = useGmailSetup()
  const canLoad = Boolean(setup.gmailStatus?.connected && setup.gmailStatus?.labelConfigured)
  const analytics = useEmailAnalytics(canLoad)

  const selectedLabelId = useMemo(() => {
    if (!setup.gmailStatus?.gmailLabelName || setup.labels.length === 0) return ''
    const match = setup.labels.find((l) => l.name === setup.gmailStatus?.gmailLabelName)
    return match?.id ?? ''
  }, [setup.gmailStatus?.gmailLabelName, setup.labels])

  const handleLabelChange = async (labelId: string): Promise<void> => {
    if (!labelId) return
    await setup.setLabel(labelId)
    await analytics.refresh()
  }

  return (
    <div className="flex flex-col">
      <GmailConnectBanner
        gmailStatus={setup.gmailStatus}
        labels={setup.labels}
        loading={setup.loading}
        connecting={setup.connecting}
        error={setup.error}
        defaultLabelName={setup.defaultLabelName}
        selectedLabelId={selectedLabelId}
        onConnect={() => void setup.connect()}
        onDisconnect={() => void setup.disconnect()}
        onLabelChange={(id) => void handleLabelChange(id)}
      />

      {canLoad ? (
        <div className="space-y-6 px-6 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {analytics.data?.label && (
                <p className="text-sm text-slate-300">
                  Monitored label:{' '}
                  <span className="font-medium text-slate-100">{analytics.data.label.name}</span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => void analytics.refresh()}
              disabled={analytics.loading}
              className="shrink-0 rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
            >
              {analytics.loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {analytics.error && <p className="text-sm text-red-400">{analytics.error}</p>}

          {analytics.loading && !analytics.data ? (
            <p className="text-sm text-slate-400">Loading analytics…</p>
          ) : analytics.data ? (
            <>
              <AnalyticsSummaryCards data={analytics.data} />
              <div className="grid gap-6 lg:grid-cols-2">
                <AnalyticsWorkflowBars
                  labelQueue={analytics.data.labelQueue}
                  scanCapped={analytics.data.gmail.scanCapped}
                  scannedCount={analytics.data.gmail.scannedCount}
                />
                <AnalyticsVolumeBars volumeByDay={analytics.data.volumeByDay} />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <AnalyticsTopSendersTable topSenders={analytics.data.topSenders} />
                <AnalyticsRecentFulfilledTable recentFulfilled={analytics.data.recentFulfilled} />
              </div>
            </>
          ) : null}
        </div>
      ) : (
        !setup.loading && (
          <p className="px-6 py-6 text-sm text-slate-500">
            Connect Gmail and select a monitored label to view analytics.
          </p>
        )
      )}
    </div>
  )
}
