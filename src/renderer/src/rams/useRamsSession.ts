import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AiLibrarySelections } from '@shared/rams/ai-generate'
import type { AiUsageSummary } from '@shared/rams/ai-usage'
import type { RamsDocument, TemplateManifest } from '@shared/rams/types'
import { cloneDocument, documentsEqual, normalizeDocument } from '@shared/rams/document'

const DISCARD_NEW_MSG = 'Discard unsaved changes and start a new RAMS?'
const DISCARD_CANCEL_MSG = 'Discard this RAMS? All unsaved changes will be lost.'

export function useRamsSession(): {
  status: 'idle' | 'editing'
  document: RamsDocument | null
  baseline: RamsDocument | null
  templateName: string | null
  aiLibrarySelections: AiLibrarySelections | null
  lastAiUsage: AiUsageSummary | null
  templates: TemplateManifest[]
  dirty: boolean
  isPickerOpen: boolean
  preparedBy: string
  openNewRams: () => void
  closePicker: () => void
  selectTemplate: (templateId: string) => Promise<void>
  generateWithAi: (input: { projectName: string; description: string }) => Promise<void>
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
  const [aiLibrarySelections, setAiLibrarySelections] = useState<AiLibrarySelections | null>(null)
  const [lastAiUsage, setLastAiUsage] = useState<AiUsageSummary | null>(null)

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
      setAiLibrarySelections(null)
      setLastAiUsage(null)
      setStatus('editing')
      setIsPickerOpen(false)
    },
    [templates]
  )

  const generateWithAi = useCallback(
    async (input: { projectName: string; description: string }) => {
      const templateId = templates[0]?.id ?? 'general-rams'
      const result = await window.api.rams.generateWithAi({
        projectName: input.projectName,
        description: input.description,
        templateId
      })
      const normalized = normalizeDocument(result.document)
      setDocument(normalized)
      setBaseline(cloneDocument(normalized))
      setTemplateName('AI generated')
      setAiLibrarySelections(result.librarySelections)
      setLastAiUsage(result.usage ?? null)
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
    setAiLibrarySelections(null)
    setLastAiUsage(null)
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
    aiLibrarySelections,
    lastAiUsage,
    templates,
    dirty,
    isPickerOpen,
    preparedBy,
    openNewRams,
    closePicker,
    selectTemplate,
    generateWithAi,
    cancelDocument,
    updateDocument
  }
}
