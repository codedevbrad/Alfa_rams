import { useCallback, useEffect, useState } from 'react'
import type { EmailAnalyticsDto } from '@shared/email/analytics'

export function useEmailAnalytics(enabled = true): {
  data: EmailAnalyticsDto | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
} {
  const [data, setData] = useState<EmailAnalyticsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<void> => {
    if (!enabled) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await window.api.email.getEmailAnalytics()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}
