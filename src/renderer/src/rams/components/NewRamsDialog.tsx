import type { TemplateManifest } from '@shared/rams/types'

interface NewRamsDialogProps {
  templates: TemplateManifest[]
  onSelect: (templateId: string) => void
  onClose: () => void
}

export function NewRamsDialog({
  templates,
  onSelect,
  onClose
}: NewRamsDialogProps): React.JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-rams-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
        <div className="border-b border-slate-700 px-5 py-4">
          <h2 id="new-rams-title" className="text-lg font-semibold text-slate-100">
            Choose a template
          </h2>
          <p className="mt-1 text-sm text-slate-400">Start a new RAMS from a template layout.</p>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {templates.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onSelect(t.id)}
                className="w-full rounded-lg px-3 py-3 text-left hover:bg-slate-800"
              >
                <span className="font-medium text-slate-100">{t.name}</span>
                <span className="mt-0.5 block text-sm text-slate-400">{t.description}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-end border-t border-slate-700 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
