import { useCallback, useState } from 'react'

export function useInboxReplyDraft(): {
  drafting: boolean
  error: string | null
  draft: (gmailMessageId: string, instructions?: string) => Promise<string | null>
} {
  const [drafting, setDrafting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const draft = useCallback(
    async (gmailMessageId: string, instructions?: string): Promise<string | null> => {
      setDrafting(true)
      setError(null)
      try {
        const result = await window.api.email.draftInboxReply({
          gmailMessageId,
          instructions
        })
        return result.body
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate draft')
        return null
      } finally {
        setDrafting(false)
      }
    },
    []
  )

  return { drafting, error, draft }
}
