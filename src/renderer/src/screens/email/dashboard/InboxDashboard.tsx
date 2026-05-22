import { useMemo } from 'react'
import { useGmailSetup } from '@renderer/systems/email/useGmailSetup'
import { useInbox } from '@renderer/systems/email/useInbox'
import { useEmailSenders } from '../useEmailSenders'
import { GmailConnectBanner } from './GmailConnectBanner'
import { InboxDetail } from './InboxDetail'
import { InboxList } from './InboxList'
import { InboxTabs } from './InboxTabs'

export function InboxDashboard(): React.JSX.Element {
  const setup = useGmailSetup()
  const canLoadInbox = Boolean(
    setup.gmailStatus?.connected && setup.gmailStatus?.labelConfigured
  )
  const inbox = useInbox(canLoadInbox)
  const { senders } = useEmailSenders()

  const selectedLabelId = useMemo(() => {
    if (!setup.gmailStatus?.gmailLabelName || setup.labels.length === 0) return ''
    const match = setup.labels.find((l) => l.name === setup.gmailStatus?.gmailLabelName)
    return match?.id ?? ''
  }, [setup.gmailStatus?.gmailLabelName, setup.labels])

  const handleLabelChange = async (labelId: string): Promise<void> => {
    if (!labelId) return
    await setup.setLabel(labelId)
    await inbox.refresh()
  }

  const handleSent = (): void => {
    void inbox.refresh()
    inbox.setInboxTab('fulfilled')
  }

  const handleFulfilled = (): void => {
    void inbox.refresh()
    inbox.setInboxTab('fulfilled')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
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

      {canLoadInbox ? (
        <>
          {inbox.error && (
            <p className="border-b border-slate-700 px-5 py-2 text-sm text-red-400">{inbox.error}</p>
          )}
          <InboxTabs
            activeTab={inbox.inboxTab}
            unfulfilledCount={inbox.unfulfilledCount}
            fulfilledCount={inbox.fulfilledCount}
            onTabChange={inbox.setInboxTab}
          />
          <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(14rem,20rem)_1fr]">
            <InboxList
              messages={inbox.filteredMessages}
              inboxTab={inbox.inboxTab}
              selectedId={inbox.selectedId}
              loading={inbox.loading}
              onSelect={inbox.selectMessage}
              onRefresh={inbox.refresh}
            />
            <InboxDetail
              detail={inbox.detail}
              loading={inbox.detailLoading}
              gmailConnected={Boolean(setup.gmailStatus?.connected)}
              senders={senders}
              onFulfilled={handleFulfilled}
              onSent={handleSent}
            />
          </div>
        </>
      ) : (
        !setup.loading && (
          <p className="px-5 py-6 text-sm text-slate-500">
            Connect Gmail and select a monitored label to load the inbox queue.
          </p>
        )
      )}
    </div>
  )
}
