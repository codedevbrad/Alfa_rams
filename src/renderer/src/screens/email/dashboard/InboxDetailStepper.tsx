import type { InboxDetailStep } from '@renderer/systems/email/useInboxDetailSteps'

interface InboxDetailStepperProps {
  step: InboxDetailStep
  locked: boolean
  onStepChange: (step: InboxDetailStep) => void
}

const STEPS: { id: InboxDetailStep; label: string }[] = [
  { id: 1, label: 'View' },
  { id: 2, label: 'Analyse' },
  { id: 3, label: 'Reply' }
]

export function InboxDetailStepper({
  step,
  locked,
  onStepChange
}: InboxDetailStepperProps): React.JSX.Element {
  return (
    <div className="flex shrink-0 gap-1 border-b border-slate-700 px-5">
      {STEPS.map((s, index) => {
        const isActive = step === s.id
        const isPast = step > s.id
        const canClick = !locked && (isPast || isActive)

        return (
          <button
            key={s.id}
            type="button"
            disabled={!canClick}
            onClick={() => canClick && onStepChange(s.id)}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-sky-500 text-slate-100'
                : isPast
                  ? 'border-transparent text-slate-300 hover:border-slate-600 hover:text-slate-100'
                  : 'border-transparent text-slate-500'
            } disabled:cursor-default disabled:opacity-60`}
          >
            <span className="text-xs text-slate-500">{index + 1}</span>
            {s.label}
          </button>
        )
      })}
    </div>
  )
}
