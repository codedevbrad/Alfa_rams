import { useCallback, useEffect, useState } from 'react'
import type { AiGenerationUsageRecord, AiUsageListResult } from '@shared/rams/ai-usage'
import { formatCostUsd, formatTokens } from '@shared/rams/ai-usage'

interface AiUsagePanelProps {
  onExportMessage?: (message: string) => void
  /** Renders as a section inside AiSettingsModal (no outer card). */
  embedded?: boolean
}

function TotalsCard({
  label,
  totals
}: {
  label: string
  totals: AiUsageListResult['allTime']
}): React.JSX.Element {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">
        {formatTokens(totals.totalTokens)} tokens
      </p>
      <p className="text-xs text-slate-400">
        {formatCostUsd(totals.estimatedCostUsd)} est. · {totals.generationCount} generation
        {totals.generationCount === 1 ? '' : 's'}
      </p>
    </div>
  )
}

function UsageRow({ record }: { record: AiGenerationUsageRecord }): React.JSX.Element {
  const date = new Date(record.timestamp).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <tr className="border-b border-slate-800/80 text-xs text-slate-300">
      <td className="whitespace-nowrap py-2 pr-3 text-slate-400">{date}</td>
      <td className="max-w-[140px] truncate py-2 pr-3 font-medium text-slate-200">
        {record.projectName}
      </td>
      <td className="whitespace-nowrap py-2 pr-3">{formatTokens(record.totals.totalTokens)}</td>
      <td className="whitespace-nowrap py-2 pr-3">
        {formatCostUsd(record.totals.estimatedCostUsd)}
      </td>
      <td className="whitespace-nowrap py-2 pr-3">{record.apiCalls.length}</td>
      <td className="py-2">
        {record.success ? (
          <span className="text-emerald-400">OK</span>
        ) : (
          <span className="text-red-400" title={record.errorMessage}>
            Failed
          </span>
        )}
      </td>
    </tr>
  )
}

export function AiUsagePanel({
  onExportMessage,
  embedded = false
}: AiUsagePanelProps): React.JSX.Element {
  const [data, setData] = useState<AiUsageListResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.api.rams.listAiUsage()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage log')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleExport = async (): Promise<void> => {
    setBusy(true)
    try {
      const result = await window.api.rams.exportAiUsageCsv()
      if (!result.canceled) {
        onExportMessage?.(`Exported to ${result.filePath}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setBusy(false)
    }
  }

  const handleClear = async (): Promise<void> => {
    if (!window.confirm('Clear all AI usage history? This cannot be undone.')) return
    setBusy(true)
    try {
      await window.api.rams.clearAiUsage()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Clear failed')
    } finally {
      setBusy(false)
    }
  }

  const wrapperClass = embedded
    ? 'flex flex-col gap-4 px-5 pb-6 pt-5'
    : 'flex w-full max-w-2xl flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl'

  return (
    <div className={wrapperClass}>
      <div>
        <h2
          className={
            embedded
              ? 'text-base font-semibold text-slate-100'
              : 'text-lg font-semibold text-slate-100'
          }
        >
          AI usage log
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Token usage and estimated cost per generation. Stored locally for finance review.
        </p>
      </div>

      {loading && !data ? (
        <p className="text-sm text-slate-400">Loading usage…</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <TotalsCard label="This month" totals={data.month} />
            <TotalsCard label="All time" totals={data.allTime} />
          </div>

          <div className="max-h-56 overflow-auto rounded-lg border border-slate-700">
            <table className="w-full min-w-[480px] text-left">
              <thead className="sticky top-0 bg-slate-800 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Project</th>
                  <th className="px-3 py-2">Tokens</th>
                  <th className="px-3 py-2">Est. cost</th>
                  <th className="px-3 py-2">Calls</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                      No AI generations logged yet.
                    </td>
                  </tr>
                ) : (
                  data.records.map((record) => <UsageRow key={record.id} record={record} />)
                )}
              </tbody>
            </table>
          </div>

          <p className="text-[0.65rem] leading-relaxed text-slate-500">
            Costs are estimates from published OpenAI USD rates; actual billing may differ.
          </p>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={busy || loading}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void handleClear()}
              disabled={busy || data.allTime.generationCount === 0}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Clear log
            </button>
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={busy || data.allTime.generationCount === 0}
              className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
