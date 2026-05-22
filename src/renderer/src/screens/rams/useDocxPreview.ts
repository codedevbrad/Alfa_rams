import { useEffect, useMemo, useState } from 'react'
import type { RamsDocument } from '@shared/rams/types'
import type { PreviewFontId } from '@shared/rams/preview-fonts'
import { normalizeDocument } from '@shared/rams/document'

const DEBOUNCE_MS = 400

export function useDocxPreview(
  document: RamsDocument | null,
  fontId: PreviewFontId
): {
  buffer: ArrayBuffer | null
  loading: boolean
  error: string | null
} {
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const documentKey = useMemo(
    () => (document ? JSON.stringify(normalizeDocument(document)) : ''),
    [document]
  )

  useEffect(() => {
    if (!document) return

    let cancelled = false
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const normalized = normalizeDocument(document)
        const result = await window.api.rams.generateDocx({
          document: normalized,
          fontId
        })
        if (!cancelled) setBuffer(result)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to generate preview')
          setBuffer(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [document, documentKey, fontId])

  return {
    buffer: document ? buffer : null,
    loading: document ? loading : false,
    error: document ? error : null
  }
}
