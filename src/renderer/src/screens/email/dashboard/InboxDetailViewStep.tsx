import type { InboxMessageDetail } from '@shared/email/inbox'

interface InboxDetailViewStepProps {
  detail: InboxMessageDetail
  locked: boolean
  onContinue: () => void
}

function statusLabel(detail: InboxMessageDetail): string {
  if (detail.workflowStatus === 'fulfilled') return 'Fulfilled'
  if (detail.workflowStatus === 'opened') return 'Opened'
  return 'Unopened'
}

export function InboxDetailViewStep({
  detail,
  locked,
  onContinue
}: InboxDetailViewStepProps): React.JSX.Element {
  return (
    <>
      <div className="shrink-0 border-b border-slate-700 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-slate-100">{detail.subject}</h2>
            <p className="mt-1 text-sm text-slate-400">{detail.from}</p>
          </div>
          <span className="shrink-0 rounded bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400">
            {statusLabel(detail)}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-300">{detail.body}</pre>
      </div>

      {!locked && (
        <div className="shrink-0 border-t border-slate-700 px-5 py-4">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
          >
            Continue to analyse
          </button>
        </div>
      )}

      {locked && (
        <div className="shrink-0 border-t border-slate-700 px-5 py-4">
          <p className="text-sm text-slate-500">This message is already fulfilled.</p>
        </div>
      )}
    </>
  )
}
