import { useCallback, useEffect, useMemo, useState } from 'react'
import type { InboxMessageDetail, InboxMessageSummary } from '@shared/email/inbox'

export type InboxTab = 'unfulfilled' | 'fulfilled'

function filterByTab(messages: InboxMessageSummary[], tab: InboxTab): InboxMessageSummary[] {
  if (tab === 'fulfilled') {
    return messages.filter((m) => m.workflowStatus === 'fulfilled')
  }
  return messages.filter((m) => m.workflowStatus !== 'fulfilled')
}

export function useInbox(enabled = true): {
  messages: InboxMessageSummary[]
  filteredMessages: InboxMessageSummary[]
  inboxTab: InboxTab
  setInboxTab: (tab: InboxTab) => void
  unfulfilledCount: number
  fulfilledCount: number
  selectedId: string | null
  detail: InboxMessageDetail | null
  loading: boolean
  detailLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  selectMessage: (gmailMessageId: string | null) => void
  fulfill: (gmailMessageId: string) => Promise<void>
} {
  const [messages, setMessages] = useState<InboxMessageSummary[]>([])
  const [inboxTab, setInboxTab] = useState<InboxTab>('unfulfilled')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<InboxMessageDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unfulfilledCount = useMemo(
    () => messages.filter((m) => m.workflowStatus !== 'fulfilled').length,
    [messages]
  )
  const fulfilledCount = useMemo(
    () => messages.filter((m) => m.workflowStatus === 'fulfilled').length,
    [messages]
  )

  const filteredMessages = useMemo(
    () => filterByTab(messages, inboxTab),
    [messages, inboxTab]
  )

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const rows = await window.api.email.listInbox()
      setMessages(rows)
      setSelectedId((prev) => {
        if (prev && rows.some((m) => m.gmailMessageId === prev)) return prev
        return null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inbox')
      setMessages([])
      setSelectedId(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const selectMessage = useCallback((gmailMessageId: string | null): void => {
    setSelectedId(gmailMessageId)
  }, [])

  useEffect(() => {
    if (enabled) void refresh()
  }, [refresh, enabled])

  useEffect(() => {
    setSelectedId((prev) => {
      if (prev && filteredMessages.some((m) => m.gmailMessageId === prev)) return prev
      return filteredMessages[0]?.gmailMessageId ?? null
    })
  }, [inboxTab, filteredMessages])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    let cancelled = false
    setDetailLoading(true)
    void window.api.email
      .getInboxMessage(selectedId)
      .then((row) => {
        if (!cancelled) {
          setDetail(row)
          setMessages((prev) =>
            prev.map((m) =>
              m.gmailMessageId === row.gmailMessageId
                ? { ...m, workflowStatus: row.workflowStatus }
                : m
            )
          )
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load message')
          setDetail(null)
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const fulfill = useCallback(
    async (gmailMessageId: string): Promise<void> => {
      await window.api.email.markInboxFulfilled(gmailMessageId)
      await refresh()
      setInboxTab('fulfilled')
    },
    [refresh]
  )

  return {
    messages,
    filteredMessages,
    inboxTab,
    setInboxTab,
    unfulfilledCount,
    fulfilledCount,
    selectedId,
    detail,
    loading,
    detailLoading,
    error,
    refresh,
    selectMessage,
    fulfill
  }
}
