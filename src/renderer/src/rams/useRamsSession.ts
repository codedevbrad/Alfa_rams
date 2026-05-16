import { useCallback, useEffect, useMemo, useState } from 'react'
import type { RamsDocument, TemplateManifest } from '@shared/rams/types'
import { cloneDocument, documentsEqual, normalizeDocument } from '@shared/rams/document'

const DISCARD_NEW_MSG = 'Discard unsaved changes and start a new RAMS?'
const DISCARD_CANCEL_MSG = 'Discard this RAMS? All unsaved changes will be lost.'

export function useRamsSession(): {
  status: 'idle' | 'editing'
  document: RamsDocument | null
  baseline: RamsDocument | null
  templateName: string | null
  templates: TemplateManifest[]
  dirty: boolean
  isPickerOpen: boolean
  preparedBy: string
  openNewRams: () => void
  closePicker: () => void
  selectTemplate: (templateId: string) => Promise<void>
  cancelDocument: () => void
  updateDocument: (doc: RamsDocument) => void
} {
  const [status, setStatus] = useState<'idle' | 'editing'>('idle')
  const [document, setDocument] = useState<RamsDocument | null>(null)
  const [baseline, setBaseline] = useState<RamsDocument | null>(null)
  const [templateName, setTemplateName] = useState<string | null>(null)
  const [templates, setTemplates] = useState<TemplateManifest[]>([])
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [preparedBy, setPreparedBy] = useState('ALFA Industrial Services Ltd')

  const dirty = useMemo(
    () => status === 'editing' && document !== null && !documentsEqual(document, baseline),
    [status, document, baseline]
  )

  useEffect(() => {
    window.api.rams.listTemplates().then(setTemplates)
    window.api.rams.getPreparedBy().then(setPreparedBy)
  }, [])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (dirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const confirmDiscard = useCallback(
    (message: string): boolean => {
      if (!dirty) return true
      return window.confirm(message)
    },
    [dirty]
  )

  const openNewRams = useCallback(() => {
    if (status === 'editing' && !confirmDiscard(DISCARD_NEW_MSG)) return
    setIsPickerOpen(true)
  }, [status, confirmDiscard])

  const closePicker = useCallback(() => {
    setIsPickerOpen(false)
  }, [])

  const selectTemplate = useCallback(
    async (templateId: string) => {
      const loaded = await window.api.rams.loadDefaults(templateId)
      const normalized = normalizeDocument(loaded)
      const manifest = templates.find((t) => t.id === templateId)
      setDocument(normalized)
      setBaseline(cloneDocument(normalized))
      setTemplateName(manifest?.name ?? templateId)
      setStatus('editing')
      setIsPickerOpen(false)
    },
    [templates]
  )

  const cancelDocument = useCallback(() => {
    if (!confirmDiscard(DISCARD_CANCEL_MSG)) return
    setDocument(null)
    setBaseline(null)
    setTemplateName(null)
    setStatus('idle')
  }, [confirmDiscard])

  const updateDocument = useCallback((doc: RamsDocument) => {
    setDocument(normalizeDocument(doc))
  }, [])

  return {
    status,
    document,
    baseline,
    templateName,
    templates,
    dirty,
    isPickerOpen,
    preparedBy,
    openNewRams,
    closePicker,
    selectTemplate,
    cancelDocument,
    updateDocument
  }
}
