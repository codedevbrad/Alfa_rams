import { useEffect, useState } from 'react'

const GENERATION_STEPS = [
  ['Loading', 'activity', 'library'],
  ['Loading', 'PPE', 'library'],
  ['Analysing', 'job', 'description'],
  ['Matching', 'hazards', 'from', 'library'],
  ['Selecting', 'PPE', 'requirements'],
  ['Generating', 'method', 'statement'],
  ['Building', 'your', 'RAMS', 'document']
] as const

const STEP_MS = 2200

export function AiGeneratingStepsOverlay(): React.JSX.Element {
  const [stepIndex, setStepIndex] = useState(0)
  const [wordPhase, setWordPhase] = useState(0)

  useEffect(() => {
    const stepTimer = window.setInterval(() => {
      setStepIndex((i) => (i + 1) % GENERATION_STEPS.length)
      setWordPhase(0)
    }, STEP_MS)

    return () => window.clearInterval(stepTimer)
  }, [])

  useEffect(() => {
    const words = GENERATION_STEPS[stepIndex]
    if (wordPhase >= words.length - 1) return

    const wordTimer = window.setTimeout(() => {
      setWordPhase((p) => p + 1)
    }, 280)

    return () => window.clearTimeout(wordTimer)
  }, [stepIndex, wordPhase])

  const words = GENERATION_STEPS[stepIndex]

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-6 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center gap-1.5">
          {GENERATION_STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === stepIndex ? 'w-8 bg-violet-400' : i < stepIndex ? 'w-1.5 bg-violet-600/60' : 'w-1.5 bg-slate-600'
              }`}
            />
          ))}
        </div>

        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-violet-300/80">
          Generating with AI
        </p>

        <div className="flex min-h-[3rem] flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {words.map((word, i) => (
            <span
              key={`${stepIndex}-${word}-${i}`}
              className={`text-xl font-semibold transition-all duration-300 sm:text-2xl ${
                i <= wordPhase
                  ? 'translate-y-0 opacity-100 text-slate-100'
                  : 'translate-y-2 opacity-0 text-slate-500'
              }`}
            >
              {word}
            </span>
          ))}
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Step {stepIndex + 1} of {GENERATION_STEPS.length}
        </p>
      </div>
    </div>
  )
}
