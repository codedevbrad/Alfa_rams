import { useState } from 'react'
import type { OpenAiStatus } from '@shared/rams/ai-generate'

interface AiRamsDialogProps {
  openAiStatus: OpenAiStatus
  generating: boolean
  error: string | null
  onGenerate: (input: { projectName: string; description: string }) => void
  onOpenSettings: () => void
  onBack: () => void
  onClose: () => void
}

export function AiRamsDialog({
  openAiStatus,
  generating,
  error,
  onGenerate,
  onOpenSettings,
  onBack,
  onClose
}: AiRamsDialogProps): React.JSX.Element {
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!openAiStatus.configured || generating) return
    onGenerate({ projectName: projectName.trim(), description: description.trim() })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-rams-title"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-slate-700 px-5 py-4">
            <h2 id="ai-rams-title" className="text-lg font-semibold text-slate-100">
              Build with AI
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Describe the job. AI will draft risk rows, PPE, and method statement using your
              library.
            </p>
          </div>

          <div className="space-y-4 p-5">
            {!openAiStatus.configured && (
              <div className="rounded-lg border border-amber-700/50 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
                OpenAI API key required.{' '}
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="font-medium underline hover:text-amber-100"
                >
                  Open settings
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300" htmlFor="ai-project-name">
                Project name
              </label>
              <input
                id="ai-project-name"
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={generating}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                placeholder="e.g. Office fit-out – Level 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300" htmlFor="ai-description">
                Job description
              </label>
              <textarea
                id="ai-description"
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={generating}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                placeholder="Scope, location, trades, equipment, duration, special hazards…"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <div className="flex justify-between gap-2 border-t border-slate-700 px-5 py-3">
            <button
              type="button"
              onClick={onBack}
              disabled={generating}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Back
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={generating}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  generating ||
                  !openAiStatus.configured ||
                  !projectName.trim() ||
                  !description.trim()
                }
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
              >
                Generate
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
