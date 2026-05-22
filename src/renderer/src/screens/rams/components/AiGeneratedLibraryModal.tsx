import { useCallback, useMemo, useState } from 'react'
import type { AiLibrarySelections } from '@shared/rams/ai-generate'
import { buildAiLibrarySummaryText } from '@shared/rams/ai-generate'
import { useRamsLibrary } from '@renderer/screens/rams/library'

interface AiGeneratedLibraryModalProps {
  selections: AiLibrarySelections
  onClose: () => void
}

function toggleSetItem(set: Set<string>, id: string): Set<string> {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

export function AiGeneratedLibraryModal({
  selections,
  onClose
}: AiGeneratedLibraryModalProps): React.JSX.Element {
  const library = useRamsLibrary()
  const [selectedRisk, setSelectedRisk] = useState<Set<string>>(() => new Set())
  const [selectedPpe, setSelectedPpe] = useState<Set<string>>(() => new Set())
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const savableRisk = useMemo(
    () => selections.generatedRiskRows.filter((r) => !r.fromLibrary),
    [selections.generatedRiskRows]
  )
  const savablePpe = useMemo(
    () => selections.generatedPpeItems.filter((p) => !p.fromLibrary),
    [selections.generatedPpeItems]
  )

  const selectAllRisk = useCallback(() => {
    setSelectedRisk(new Set(savableRisk.map((r) => r.id)))
  }, [savableRisk])

  const selectAllPpe = useCallback(() => {
    setSelectedPpe(new Set(savablePpe.map((p) => p.id)))
  }, [savablePpe])

  const resolveCategoryId = useCallback(
    async (categoryName: string): Promise<number> => {
      const name = categoryName.trim() || 'General'
      const existing = library.activityCategories.find(
        (c) => c.category.trim().toLowerCase() === name.toLowerCase()
      )
      if (existing) return existing.id
      const row = await window.api.rams.upsertActivityCategory({ name })
      await library.refresh()
      return row.id
    },
    [library]
  )

  const resolvePpeGroupId = useCallback(
    async (groupName: string): Promise<number> => {
      const name = groupName.trim() || 'General'
      const existing = library.ppeCategories.find(
        (g) => g.group.trim().toLowerCase() === name.toLowerCase()
      )
      if (existing) return existing.id
      const row = await window.api.rams.upsertPpeGroup({ name })
      await library.refresh()
      return row.id
    },
    [library]
  )

  const handleSave = async (): Promise<void> => {
    const riskIds = [...selectedRisk]
    const ppeIds = [...selectedPpe]
    if (riskIds.length === 0 && ppeIds.length === 0) {
      setError('Select at least one item to save.')
      return
    }

    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      let saved = 0

      for (const entry of selections.generatedRiskRows) {
        if (!riskIds.includes(entry.id) || entry.fromLibrary) continue
        const categoryId = await resolveCategoryId(entry.category)
        await library.upsertActivityHazard({
          categoryId,
          activity: entry.row.activity,
          hazard: entry.row.hazard,
          likelihood: entry.row.likelihood,
          severity: entry.row.severity,
          who: entry.row.who,
          controls: entry.row.controls,
          residualLikelihood: entry.row.residualLikelihood,
          residualSeverity: entry.row.residualSeverity,
          residualWho: entry.row.residualWho,
          monitoring: entry.row.monitoring
        })
        saved++
      }

      for (const entry of selections.generatedPpeItems) {
        if (!ppeIds.includes(entry.id) || entry.fromLibrary) continue
        const groupId = await resolvePpeGroupId(entry.item.category)
        await library.upsertPpeItem({
          groupId,
          category: entry.item.category,
          requirement: entry.item.requirement
        })
        saved++
      }

      setMessage(`Saved ${saved} item${saved === 1 ? '' : 's'} to the library.`)
      setSelectedRisk(new Set())
      setSelectedPpe(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-library-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose()
      }}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-violet-800/50 bg-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-700 px-5 py-4">
          <h2 id="ai-library-modal-title" className="text-lg font-semibold text-violet-100">
            AI generated — library details
          </h2>
          <p className="mt-1 text-sm text-slate-400">{buildAiLibrarySummaryText(selections)}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-200">
              Activities / risk rows ({selections.generatedRiskRows.length})
            </h3>
            {savableRisk.length > 0 && (
              <button
                type="button"
                onClick={selectAllRisk}
                className="text-xs text-violet-300 hover:text-violet-200"
              >
                Select all new ({savableRisk.length})
              </button>
            )}
          </div>

          <div className="mb-6 grid gap-2 sm:grid-cols-2">
            {selections.generatedRiskRows.length === 0 ? (
              <p className="text-sm text-slate-500 sm:col-span-2">No risk rows generated.</p>
            ) : (
              selections.generatedRiskRows.map((entry) => {
                const checked = selectedRisk.has(entry.id)
                const disabled = entry.fromLibrary

                return (
                  <label
                    key={entry.id}
                    className={`flex gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      disabled
                        ? 'cursor-default border-slate-700/60 bg-slate-800/30 opacity-70'
                        : 'cursor-pointer ' +
                          (checked
                            ? 'border-violet-500 bg-violet-950/50'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600')
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 shrink-0"
                      checked={checked}
                      disabled={disabled || saving}
                      onChange={() =>
                        !disabled && setSelectedRisk((s) => toggleSetItem(s, entry.id))
                      }
                    />
                    <div className="min-w-0 flex-1 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-100">{entry.row.activity}</span>
                        {entry.fromLibrary && (
                          <span className="rounded bg-emerald-900/50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-emerald-300">
                            In library
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-slate-400">{entry.row.hazard}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {entry.category} · L{entry.row.likelihood}×S{entry.row.severity}
                      </p>
                    </div>
                  </label>
                )
              })
            )}
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-200">
              PPE ({selections.generatedPpeItems.length})
            </h3>
            {savablePpe.length > 0 && (
              <button
                type="button"
                onClick={selectAllPpe}
                className="text-xs text-violet-300 hover:text-violet-200"
              >
                Select all new ({savablePpe.length})
              </button>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {selections.generatedPpeItems.length === 0 ? (
              <p className="text-sm text-slate-500 sm:col-span-2 lg:col-span-3">No PPE generated.</p>
            ) : (
              selections.generatedPpeItems.map((entry) => {
                const checked = selectedPpe.has(entry.id)
                const disabled = entry.fromLibrary

                return (
                  <label
                    key={entry.id}
                    className={`flex gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      disabled
                        ? 'cursor-default border-slate-700/60 bg-slate-800/30 opacity-70'
                        : 'cursor-pointer ' +
                          (checked
                            ? 'border-violet-500 bg-violet-950/50'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600')
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 shrink-0"
                      checked={checked}
                      disabled={disabled || saving}
                      onChange={() =>
                        !disabled && setSelectedPpe((s) => toggleSetItem(s, entry.id))
                      }
                    />
                    <div className="min-w-0 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-100">{entry.item.category}</span>
                        {entry.fromLibrary && (
                          <span className="rounded bg-emerald-900/50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-emerald-300">
                            In library
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-slate-400">{entry.item.requirement}</p>
                    </div>
                  </label>
                )
              })
            )}
          </div>
        </div>

        {message && <p className="px-5 text-sm text-emerald-400">{message}</p>}
        {error && <p className="px-5 text-sm text-red-400">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-700 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || (selectedRisk.size === 0 && selectedPpe.size === 0)}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save selected to library'}
          </button>
        </div>
      </div>
    </div>
  )
}
