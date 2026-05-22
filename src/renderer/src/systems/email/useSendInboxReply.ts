import { useCallback, useState } from 'react'

export function useSendInboxReply(): {
  sending: boolean
  error: string | null
  send: (gmailMessageId: string, body: string, senderId?: number) => Promise<boolean>
} {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(
    async (gmailMessageId: string, body: string, senderId?: number): Promise<boolean> => {
      setSending(true)
      setError(null)
      try {
        await window.api.email.sendInboxReply({
          gmailMessageId,
          body,
          ...(senderId != null ? { senderId } : {})
        })
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send reply')
        return false
      } finally {
        setSending(false)
      }
    },
    []
  )

  return { sending, error, send }
}
