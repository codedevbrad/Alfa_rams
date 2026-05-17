import type { OpenAiStatus } from '@shared/rams/ai-generate'
import { OpenAiSettingsPanel } from './OpenAiSettingsPanel'
import { AiUsagePanel } from './AiUsagePanel'

interface AiSettingsModalProps {
  openAiStatus: OpenAiStatus
  openAiStatusLoading: boolean
  usageExportMessage: string | null
  onClose: () => void
  onOpenAiSaved: () => void
  onUsageExportMessage: (message: string) => void
}

export function AiSettingsModal({
  openAiStatus,
  openAiStatusLoading,
  usageExportMessage,
  onClose,
  onOpenAiSaved,
  onUsageExportMessage
}: AiSettingsModalProps): React.JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-settings-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-700 px-5 py-4">
          <div>
            <h2 id="ai-settings-modal-title" className="text-lg font-semibold text-slate-100">
              AI settings
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              OpenAI configuration and local usage log for finance review.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <OpenAiSettingsPanel
            embedded
            status={openAiStatus}
            loading={openAiStatusLoading}
            onSaved={onOpenAiSaved}
          />

          <div className="border-t border-slate-700" />

          <AiUsagePanel embedded onExportMessage={onUsageExportMessage} />
        </div>

        {usageExportMessage && (
          <p className="shrink-0 border-t border-slate-700 px-5 py-3 text-sm text-emerald-400">
            {usageExportMessage}
          </p>
        )}
      </div>
    </div>
  )
}
