import { useCallback, useEffect, useState } from 'react'
import type { EmailSenderDto, UpsertEmailSenderInput } from '@shared/email/senders'

export function useEmailSenders(): {
  senders: EmailSenderDto[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  upsert: (input: UpsertEmailSenderInput) => Promise<EmailSenderDto>
  remove: (id: number) => Promise<void>
} {
  const [senders, setSenders] = useState<EmailSenderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const rows = await window.api.email.listEmailSenders()
      setSenders(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load email senders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const upsert = useCallback(async (input: UpsertEmailSenderInput): Promise<EmailSenderDto> => {
    const row = await window.api.email.upsertEmailSender(input)
    setSenders((prev) => {
      const index = prev.findIndex((s) => s.id === row.id)
      if (index === -1) {
        return [...prev, row].sort((a, b) => a.name.localeCompare(b.name))
      }
      return prev
        .map((s) => (s.id === row.id ? row : s))
        .sort((a, b) => a.name.localeCompare(b.name))
    })
    return row
  }, [])

  const remove = useCallback(async (id: number): Promise<void> => {
    await window.api.email.deleteEmailSender(id)
    setSenders((prev) => prev.filter((s) => s.id !== id))
  }, [])

  return { senders, loading, error, refresh, upsert, remove }
}
