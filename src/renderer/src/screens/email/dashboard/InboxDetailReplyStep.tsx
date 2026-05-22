import type { EmailSenderDto } from '@shared/email/senders'
import { InboxOpenAiBanner } from './InboxOpenAiBanner'

interface InboxDetailReplyStepProps {
  openAiConfigured: boolean
  gmailConnected: boolean
  senders: EmailSenderDto[]
  instructions: string
  replyBody: string
  senderId: number | ''
  drafting: boolean
  draftError: string | null
  sending: boolean
  sendError: string | null
  onOpenSettings: () => void
  onInstructionsChange: (value: string) => void
  onReplyBodyChange: (value: string) => void
  onSenderIdChange: (value: number | '') => void
  onDraft: () => void
  onSend: () => void
  onFulfill: () => void
}

export function InboxDetailReplyStep({
  openAiConfigured,
  gmailConnected,
  senders,
  instructions,
  replyBody,
  senderId,
  drafting,
  draftError,
  sending,
  sendError,
  onOpenSettings,
  onInstructionsChange,
  onReplyBodyChange,
  onSenderIdChange,
  onDraft,
  onSend,
  onFulfill
}: InboxDetailReplyStepProps): React.JSX.Element {
  const canSend = gmailConnected && replyBody.trim() && !sending

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <InboxOpenAiBanner configured={openAiConfigured} onOpenSettings={onOpenSettings} />

        <label className="block text-sm font-medium text-slate-300" htmlFor="draft-instructions">
          Draft instructions (optional)
        </label>
        <input
          id="draft-instructions"
          type="text"
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          placeholder="e.g. ask for site address and start date"
          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void onDraft()}
            disabled={drafting || !openAiConfigured}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {drafting ? 'Generating…' : 'Generate draft'}
          </button>
        </div>
        {draftError && <p className="mt-2 text-sm text-red-400">{draftError}</p>}

        <label className="mt-4 block text-sm font-medium text-slate-300" htmlFor="reply-body">
          Reply
        </label>
        <textarea
          id="reply-body"
          rows={8}
          value={replyBody}
          onChange={(e) => onReplyBodyChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
        />

        {senders.length > 0 && (
          <>
            <label className="mt-3 block text-sm font-medium text-slate-300" htmlFor="reply-sender">
              Send as (optional)
            </label>
            <select
              id="reply-sender"
              value={senderId}
              onChange={(e) =>
                onSenderIdChange(e.target.value === '' ? '' : Number(e.target.value))
              }
              className="mt-1 w-full max-w-md rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Connected Gmail account</option>
              {senders.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} &lt;{s.email}&gt;
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Custom senders must be configured as Gmail “Send mail as” aliases.
            </p>
          </>
        )}

        {!gmailConnected && (
          <p className="mt-2 text-sm text-amber-400">
            Connect Gmail on the dashboard to send replies. If send fails after an app update,
            disconnect and reconnect Gmail to grant send permission.
          </p>
        )}
        {sendError && <p className="mt-2 text-sm text-red-400">{sendError}</p>}
      </div>

      <div className="shrink-0 border-t border-slate-700 px-5 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void onSend()}
            disabled={!canSend}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send reply'}
          </button>
          <button
            type="button"
            onClick={() => void onFulfill()}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Mark fulfilled
          </button>
        </div>
      </div>
    </div>
  )
}
