import type { GmailLabelDto, GmailStatusDto } from '@shared/email/gmail'

interface GmailConnectBannerProps {
  gmailStatus: GmailStatusDto | null
  labels: GmailLabelDto[]
  loading: boolean
  connecting: boolean
  error: string | null
  defaultLabelName: string
  selectedLabelId: string
  onConnect: () => void
  onDisconnect: () => void
  onLabelChange: (labelId: string) => void
}

export function GmailConnectBanner({
  gmailStatus,
  labels,
  loading,
  connecting,
  error,
  defaultLabelName,
  selectedLabelId,
  onConnect,
  onDisconnect,
  onLabelChange
}: GmailConnectBannerProps): React.JSX.Element {
  if (loading) {
    return <p className="px-5 py-4 text-sm text-slate-400">Loading Gmail settings…</p>
  }

  return (
    <div className="border-b border-slate-700 px-5 py-4">
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      {!gmailStatus?.connected ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Connect Gmail to load messages tagged with <span className="text-slate-200">{defaultLabelName}</span>.
          </p>
          <button
            type="button"
            onClick={() => void onConnect()}
            disabled={connecting}
            className="shrink-0 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {connecting ? 'Connecting…' : 'Connect Gmail'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-emerald-400">Gmail connected</span>
            <button
              type="button"
              onClick={() => void onDisconnect()}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              Disconnect
            </button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="gmail-label" className="text-sm text-slate-400">
              Monitored label
            </label>
            <select
              id="gmail-label"
              value={selectedLabelId}
              onChange={(e) => void onLabelChange(e.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Select a label…</option>
              {labels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {!gmailStatus.labelConfigured && (
            <p className="text-sm text-amber-400">
              Create the label <span className="font-medium text-amber-200">{defaultLabelName}</span> in
              Gmail, apply it to messages to process, refresh, then select it above.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
