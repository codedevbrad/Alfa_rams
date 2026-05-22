import { useCallback, useState } from 'react'
import type { OpenAiStatus } from '@shared/rams/ai-generate'
import { suggestedFileName } from '@shared/rams/document'
import { validateDocument } from '@shared/rams/validate'
import { useAppNavigation } from '@renderer/navigation'
import { HomeScreen } from '@renderer/screens/rams/home'
import { useRamsSession } from './useRamsSession'
import { useDocxPreview } from './useDocxPreview'
import { NewRamsDialog } from './components/NewRamsDialog'
import { RamsToolbar } from './components/RamsToolbar'
import { RamsEditor } from './components/RamsEditor'
import { DocumentPreview } from './components/DocumentPreview'
import { SaveBanner } from './components/SaveBanner'
import { AiGeneratingStepsOverlay } from './components/AiGeneratingStepsOverlay'
import { AiGeneratedSummaryBar } from './components/AiGeneratedSummaryBar'
import { AiGeneratedLibraryModal } from './components/AiGeneratedLibraryModal'
import {
  loadStoredPreviewFontId,
  storePreviewFontId,
  type PreviewFontId
} from './preview-fonts'

function RamsScreenContent(): React.JSX.Element {
  const { navigate } = useAppNavigation()
  const session = useRamsSession()
  const [fontId, setFontId] = useState<PreviewFontId>(loadStoredPreviewFontId)
  const { buffer, loading, error } = useDocxPreview(session.document, fontId)
  const [saving, setSaving] = useState(false)
  const [savedFilePath, setSavedFilePath] = useState<string | null>(null)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [openAiStatus, setOpenAiStatus] = useState<OpenAiStatus>({ configured: false })
  const [aiLibraryModalOpen, setAiLibraryModalOpen] = useState(false)
  const refreshOpenAiStatus = useCallback(async (): Promise<OpenAiStatus> => {
    try {
      const status = await window.api.rams.getOpenAiStatus()
      setOpenAiStatus(status)
      return status
    } catch {
      const fallback = { configured: false }
      setOpenAiStatus(fallback)
      return fallback
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (!session.document) return
    const validation = validateDocument(session.document)
    if (!validation.valid) {
      window.alert(validation.errors.join('\n'))
      return
    }

    setSaving(true)
    setSavedFilePath(null)
    try {
      const docxBuffer = await window.api.rams.generateDocx({
        document: session.document,
        fontId
      })
      const result = await window.api.rams.saveDocx({
        buffer: docxBuffer,
        suggestedName: suggestedFileName(session.document)
      })
      if (!result.canceled) {
        setSavedFilePath(result.filePath)
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [session.document, fontId])

  const handleFontChange = useCallback((next: PreviewFontId) => {
    setFontId(next)
    storePreviewFontId(next)
  }, [])

  const handleOpenNew = useCallback(() => {
    setSavedFilePath(null)
    setAiError(null)
    setAiLibraryModalOpen(false)
    void refreshOpenAiStatus()
    session.openNewRams()
  }, [session, refreshOpenAiStatus])

  const handleStartAiStep = useCallback(() => {
    void refreshOpenAiStatus()
  }, [refreshOpenAiStatus])

  const openSettings = useCallback(() => {
    void refreshOpenAiStatus()
    navigate('settings')
  }, [navigate, refreshOpenAiStatus])

  const handleOpenSettingsFromPicker = useCallback(() => {
    session.closePicker()
    navigate('settings')
  }, [session, navigate])

  const handleGenerateAi = useCallback(
    async (input: { projectName: string; description: string }) => {
      setAiGenerating(true)
      setAiError(null)
      setAiLibraryModalOpen(false)
      try {
        await session.generateWithAi(input)
      } catch (err) {
        setAiError(err instanceof Error ? err.message : 'Generation failed')
      } finally {
        setAiGenerating(false)
      }
    },
    [session]
  )

  const handleCancel = useCallback(() => {
    setSavedFilePath(null)
    session.cancelDocument()
  }, [session])

  const handleOpenSaved = useCallback(async () => {
    if (!savedFilePath) return

    const openPath = window.api?.rams?.openPath
    if (typeof openPath !== 'function') {
      window.alert('Open file is unavailable. Restart the app and try again.')
      return
    }

    try {
      await openPath(savedFilePath)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not open file')
    }
  }, [savedFilePath])

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      {session.status === 'editing' && session.document && (
        <RamsToolbar
          templateName={session.templateName}
          preparedBy={session.preparedBy}
          dirty={session.dirty}
          saving={saving}
          onNewRams={handleOpenNew}
          onCancel={handleCancel}
          onSave={() => void handleSave()}
        />
      )}

      {savedFilePath && (
        <SaveBanner
          filePath={savedFilePath}
          onOpen={() => void handleOpenSaved()}
          onDismiss={() => setSavedFilePath(null)}
        />
      )}

      {session.status === 'idle' && (
        <div className="flex min-h-0 flex-1 flex-col">
          <HomeScreen
            onNewRams={handleOpenNew}
            onOpenSettings={openSettings}
          />
        </div>
      )}

      {aiGenerating && <AiGeneratingStepsOverlay />}

      {session.status === 'editing' && session.document && (
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 overflow-hidden lg:grid-cols-2 lg:grid-rows-1">
          <div className="flex min-h-0 flex-col overflow-hidden border-r border-slate-700">
            {session.aiLibrarySelections && (
              <AiGeneratedSummaryBar
                selections={session.aiLibrarySelections}
                usage={session.lastAiUsage}
                onOpenModal={() => setAiLibraryModalOpen(true)}
              />
            )}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <RamsEditor document={session.document} onChange={session.updateDocument} />
            </div>
          </div>
          <div className="flex min-h-0 flex-col overflow-hidden">
            <DocumentPreview
              buffer={buffer}
              loading={loading}
              error={error}
              fontId={fontId}
              onFontChange={handleFontChange}
            />
          </div>
        </div>
      )}

      {session.isPickerOpen && (
        <NewRamsDialog
          templates={session.templates}
          openAiStatus={openAiStatus}
          generating={aiGenerating}
          aiError={aiError}
          onSelectTemplate={(id) => void session.selectTemplate(id)}
          onStartAi={handleStartAiStep}
          onGenerateAi={(input) => void handleGenerateAi(input)}
          onOpenSettings={handleOpenSettingsFromPicker}
          onClose={session.closePicker}
        />
      )}

      {aiLibraryModalOpen && session.aiLibrarySelections && (
        <AiGeneratedLibraryModal
          selections={session.aiLibrarySelections}
          onClose={() => setAiLibraryModalOpen(false)}
        />
      )}

    </div>
  )
}

export function RamsScreen(): React.JSX.Element {
  return <RamsScreenContent />
}