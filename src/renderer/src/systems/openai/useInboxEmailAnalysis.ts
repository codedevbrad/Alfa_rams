import { useCallback, useState } from 'react'
import type { InboxEmailAnalysis } from '@shared/email/inbox'

export function useInboxEmailAnalysis(): {
  analysing: boolean
  error: string | null
  analyze: (gmailMessageId: string) => Promise<InboxEmailAnalysis | null>
} {
  const [analysing, setAnalysing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(
    async (gmailMessageId: string): Promise<InboxEmailAnalysis | null> => {
      setAnalysing(true)
      setError(null)
      try {
        const result = await window.api.email.analyzeInboxEmail({ gmailMessageId })
        return result.analysis
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyse email')
        return null
      } finally {
        setAnalysing(false)
      }
    },
    []
  )

  return { analysing, error, analyze }
}
