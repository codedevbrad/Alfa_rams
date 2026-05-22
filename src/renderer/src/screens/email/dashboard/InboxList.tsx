import type { InboxMessageSummary, InboxWorkflowStatus } from '@shared/email/inbox'
import type { InboxTab } from '@renderer/systems/email/useInbox'

function formatDate(ms: number): string {
  if (!ms) return ''
  return new Date(ms).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function statusBadgeLabel(status: InboxWorkflowStatus, tab: InboxTab): string | null {
  if (tab === 'fulfilled') return null
  if (status === 'unopened') return 'Unopened'
  if (status === 'opened') return 'Opened'
  return null
}

function statusBadgeClass(status: InboxWorkflowStatus): string {
  if (status === 'unopened') return 'bg-amber-900/50 text-amber-300'
  if (status === 'opened') return 'bg-sky-900/50 text-sky-300'
  return 'bg-slate-700 text-slate-400'
}

interface InboxListProps {
  messages: InboxMessageSummary[]
  inboxTab: InboxTab
  selectedId: string | null
  loading: boolean
  onSelect: (id: string) => void
  onRefresh: () => void
}

export function InboxList({
  messages,
  inboxTab,
  selectedId,
  loading,
  onSelect,
  onRefresh
}: InboxListProps): React.JSX.Element {
  const emptyMessage =
    inboxTab === 'fulfilled' ? 'No fulfilled messages.' : 'No unfulfilled messages.'

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-slate-700">
      <div className="flex items-center justify-between gap-2 border-b border-slate-700 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Inbox</span>
        <button
          type="button"
          onClick={() => void onRefresh()}
          disabled={loading}
          className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && messages.length === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-500">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-500">{emptyMessage}</p>
        ) : (
          <ul>
            {messages.map((m) => {
              const badge = statusBadgeLabel(m.workflowStatus, inboxTab)
              return (
                <li key={m.gmailMessageId}>
                  <button
                    type="button"
                    onClick={() => onSelect(m.gmailMessageId)}
                    className={`w-full border-b border-slate-800 px-3 py-3 text-left hover:bg-slate-800/50 ${
                      selectedId === m.gmailMessageId ? 'bg-slate-800' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-100">
                        {m.subject}
                      </p>
                      {badge && (
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusBadgeClass(m.workflowStatus)}`}
                        >
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-400">{m.from}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{m.snippet}</p>
                    <p className="mt-1 text-xs text-slate-600">{formatDate(m.internalDate)}</p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
