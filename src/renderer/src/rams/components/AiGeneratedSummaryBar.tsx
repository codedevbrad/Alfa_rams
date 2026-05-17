import { buildAiLibrarySummaryText, type AiLibrarySelections } from '@shared/rams/ai-generate'
import type { AiUsageSummary } from '@shared/rams/ai-usage'
import { formatUsageHint } from '@shared/rams/ai-usage'

interface AiGeneratedSummaryBarProps {
  selections: AiLibrarySelections
  usage?: AiUsageSummary | null
  onOpenModal: () => void
}

export function AiGeneratedSummaryBar({
  selections,
  usage,
  onOpenModal
}: AiGeneratedSummaryBarProps): React.JSX.Element {
  const summary = buildAiLibrarySummaryText(selections)
  const savableCount =
    selections.generatedRiskRows.filter((r) => !r.fromLibrary).length +
    selections.generatedPpeItems.filter((p) => !p.fromLibrary).length

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-violet-800/40 bg-violet-950/40 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-violet-100">AI generated RAMS</p>
        <p className="mt-0.5 text-xs text-slate-400">{summary}</p>
        {usage && (
          <p className="mt-0.5 text-xs text-violet-300/80">{formatUsageHint(usage)}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onOpenModal}
        className="shrink-0 rounded-lg border border-violet-600/60 bg-violet-900/50 px-3 py-1.5 text-xs font-semibold text-violet-100 hover:border-violet-500 hover:bg-violet-900"
      >
        View library details
        {savableCount > 0 ? ` (${savableCount} to save)` : ''}
      </button>
    </div>
  )
}
