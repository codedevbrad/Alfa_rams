import { useState } from 'react'
import type { OpenAiStatus } from '@shared/rams/ai-generate'
import type { TemplateManifest } from '@shared/rams/types'
import { AiRamsDialog } from './AiRamsDialog'

type PickerStep = 'chooseMode' | 'template' | 'ai'

interface NewRamsDialogProps {
  templates: TemplateManifest[]
  openAiStatus: OpenAiStatus
  generating: boolean
  aiError: string | null
  onSelectTemplate: (templateId: string) => void
  onStartAi: () => void
  onGenerateAi: (input: { projectName: string; description: string }) => void
  onOpenSettings: () => void
  onClose: () => void
}

export function NewRamsDialog({
  templates,
  openAiStatus,
  generating,
  aiError,
  onSelectTemplate,
  onStartAi,
  onGenerateAi,
  onOpenSettings,
  onClose
}: NewRamsDialogProps): React.JSX.Element {
  const [step, setStep] = useState<PickerStep>('chooseMode')

  if (step === 'ai') {
    return (
      <AiRamsDialog
        openAiStatus={openAiStatus}
        generating={generating}
        error={aiError}
        onGenerate={onGenerateAi}
        onOpenSettings={onOpenSettings}
        onBack={() => setStep('chooseMode')}
        onClose={onClose}
      />
    )
  }

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
            {step === 'chooseMode' ? 'New RAMS' : 'Choose a template'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {step === 'chooseMode'
              ? 'Start from a template or generate a draft with AI.'
              : 'Pick a template layout for your document.'}
          </p>
        </div>

        {step === 'chooseMode' ? (
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setStep('template')}
              className="rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-5 text-left hover:border-sky-600 hover:bg-slate-800"
            >
              <span className="block font-semibold text-slate-100">From template</span>
              <span className="mt-1 block text-sm text-slate-400">
                Blank RAMS using a Word template layout.
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                onStartAi()
                setStep('ai')
              }}
              className="rounded-lg border border-violet-700/60 bg-violet-950/30 px-4 py-5 text-left hover:border-violet-500 hover:bg-violet-950/50"
            >
              <span className="block font-semibold text-slate-100">Build with AI</span>
              <span className="mt-1 block text-sm text-slate-400">
                Describe the job; AI drafts content from your library.
              </span>
            </button>
          </div>
        ) : (
          <>
            <ul className="max-h-80 overflow-y-auto p-2">
              {templates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(t.id)}
                    className="w-full rounded-lg px-3 py-3 text-left hover:bg-slate-800"
                  >
                    <span className="font-medium text-slate-100">{t.name}</span>
                    <span className="mt-0.5 block text-sm text-slate-400">{t.description}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-700 px-5 py-2">
              <button
                type="button"
                onClick={() => setStep('chooseMode')}
                className="text-sm text-slate-400 hover:text-slate-200"
              >
                ← Back
              </button>
            </div>
          </>
        )}

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
