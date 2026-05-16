interface RamsToolbarProps {
  templateName: string | null
  preparedBy: string
  dirty: boolean
  saving: boolean
  onNewRams: () => void
  onCancel: () => void
  onSave: () => void
}

export function RamsToolbar({
  templateName,
  preparedBy,
  dirty,
  saving,
  onNewRams,
  onCancel,
  onSave
}: RamsToolbarProps): React.JSX.Element {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-slate-700 bg-slate-900 px-4 py-3">
      <span className="text-sm font-medium text-slate-300">{templateName ?? 'RAMS'}</span>
      {dirty && (
        <span className="rounded bg-amber-900/50 px-2 py-0.5 text-xs text-amber-200">Unsaved</span>
      )}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">
          Prepared by: <span className="text-slate-300">{preparedBy}</span>
        </span>
        <button
          type="button"
          onClick={onNewRams}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
        >
          New RAMS
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save .docx'}
        </button>
      </div>
    </header>
  )
}
