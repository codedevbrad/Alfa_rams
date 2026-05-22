import { useCallback, useEffect, useState } from 'react'
import type { GmailLabelDto, GmailStatusDto } from '@shared/email/gmail'
import { DEFAULT_GMAIL_MONITOR_LABEL } from '@shared/email/gmail'

export function useGmailSetup(): {
  gmailStatus: GmailStatusDto | null
  labels: GmailLabelDto[]
  loading: boolean
  connecting: boolean
  error: string | null
  refresh: () => Promise<void>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  setLabel: (labelId: string) => Promise<void>
  defaultLabelName: string
} {
  const [gmailStatus, setGmailStatus] = useState<GmailStatusDto | null>(null)
  const [labels, setLabels] = useState<GmailLabelDto[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const gStatus = await window.api.email.getGmailStatus()
      setGmailStatus(gStatus)
      if (gStatus.connected) {
        const labelRows = await window.api.email.listGmailLabels()
        setLabels(labelRows)
      } else {
        setLabels([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Gmail settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const connect = useCallback(async (): Promise<void> => {
    setConnecting(true)
    setError(null)
    try {
      await window.api.email.connectGmail()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gmail connect failed')
    } finally {
      setConnecting(false)
    }
  }, [refresh])

  const disconnect = useCallback(async (): Promise<void> => {
    await window.api.email.disconnectGmail()
    await refresh()
  }, [refresh])

  const setLabel = useCallback(
    async (labelId: string): Promise<void> => {
      await window.api.email.setGmailLabel(labelId)
      await refresh()
    },
    [refresh]
  )

  return {
    gmailStatus,
    labels,
    loading,
    connecting,
    error,
    refresh,
    connect,
    disconnect,
    setLabel,
    defaultLabelName: DEFAULT_GMAIL_MONITOR_LABEL
  }
}
