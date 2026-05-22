import { useCallback, useEffect, useState } from 'react'
import type { InboxEmailAnalysis } from '@shared/email/inbox'
import { instructionsFromAnalysis } from '@shared/email/inbox'

export type InboxDetailStep = 1 | 2 | 3

export function useInboxDetailSteps(gmailMessageId: string | undefined): {
  step: InboxDetailStep
  setStep: (step: InboxDetailStep) => void
  analysis: InboxEmailAnalysis | null
  setAnalysis: (analysis: InboxEmailAnalysis | null) => void
  applyAnalysisToInstructions: () => string
} {
  const [step, setStep] = useState<InboxDetailStep>(1)
  const [analysis, setAnalysis] = useState<InboxEmailAnalysis | null>(null)

  useEffect(() => {
    setStep(1)
    setAnalysis(null)
  }, [gmailMessageId])

  const applyAnalysisToInstructions = useCallback((): string => {
    if (!analysis) return ''
    return instructionsFromAnalysis(analysis)
  }, [analysis])

  return {
    step,
    setStep,
    analysis,
    setAnalysis,
    applyAnalysisToInstructions
  }
}
