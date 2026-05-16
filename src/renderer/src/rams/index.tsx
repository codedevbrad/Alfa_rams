import { useCallback, useState } from 'react'
import { suggestedFileName } from '@shared/rams/document'
import { validateDocument } from '@shared/rams/validate'
import { useRamsSession } from './useRamsSession'
import { useDocxPreview } from './useDocxPreview'
import { RamsHome } from './components/RamsHome'
import { NewRamsDialog } from './components/NewRamsDialog'
import { RamsToolbar } from './components/RamsToolbar'
import { RamsEditor } from './components/RamsEditor'
import { DocumentPreview } from './components/DocumentPreview'
import { SaveBanner } from './components/SaveBanner'
import {
  loadStoredPreviewFontId,
  storePreviewFontId,
  type PreviewFontId
} from './preview-fonts'

export default function RamsBuilder(): React.JSX.Element {
  const session = useRamsSession()
  const [fontId, setFontId] = useState<PreviewFontId>(loadStoredPreviewFontId)
  const { buffer, loading, error } = useDocxPreview(session.document, fontId)
  const [saving, setSaving] = useState(false)
  const [savedFilePath, setSavedFilePath] = useState<string | null>(null)

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
    if (session.templates.length === 1) {
      void session.selectTemplate(session.templates[0].id)
      return
    }
    session.openNewRams()
  }, [session])

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

      {session.status === 'idle' && <RamsHome onNewRams={handleOpenNew} />}

      {session.status === 'editing' && session.document && (
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 overflow-hidden lg:grid-cols-2 lg:grid-rows-1">
          <div className="min-h-0 overflow-y-auto overscroll-contain border-r border-slate-700">
            <RamsEditor document={session.document} onChange={session.updateDocument} />
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
          onSelect={(id) => void session.selectTemplate(id)}
          onClose={session.closePicker}
        />
      )}
    </div>
  )
}
