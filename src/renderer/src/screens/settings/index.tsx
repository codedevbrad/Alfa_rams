import { useCallback, useEffect, useState } from 'react'
import type { OpenAiStatus } from '@shared/rams/ai-generate'
import { OpenAiSettingsPanel } from './OpenAiSettingsPanel'
import { AiUsagePanel } from './AiUsagePanel'

export function SettingsScreen(): React.JSX.Element {
  const [usageExportMessage, setUsageExportMessage] = useState<string | null>(null)
  const [openAiStatus, setOpenAiStatus] = useState<OpenAiStatus>({ configured: false })
  const [openAiStatusLoading, setOpenAiStatusLoading] = useState(false)

  const refreshOpenAiStatus = useCallback(async (): Promise<OpenAiStatus> => {
    setOpenAiStatusLoading(true)
    try {
      const status = await window.api.rams.getOpenAiStatus()
      setOpenAiStatus(status)
      return status
    } catch {
      const fallback = { configured: false }
      setOpenAiStatus(fallback)
      return fallback
    } finally {
      setOpenAiStatusLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshOpenAiStatus()
  }, [refreshOpenAiStatus])

  const handleUsageExportMessage = useCallback((msg: string) => {
    setUsageExportMessage(msg)
    setTimeout(() => setUsageExportMessage(null), 5000)
  }, [])

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="shrink-0 border-b border-slate-700 px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-100">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          OpenAI API key and local usage log for AI RAMS and inbox reply drafts.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-2xl">
          <OpenAiSettingsPanel
            embedded
            status={openAiStatus}
            loading={openAiStatusLoading}
            onSaved={() => void refreshOpenAiStatus()}
          />

          <div className="border-t border-slate-700" />

          <AiUsagePanel embedded onExportMessage={handleUsageExportMessage} />
        </div>
      </div>

      {usageExportMessage && (
        <p className="shrink-0 border-t border-slate-700 px-6 py-3 text-sm text-emerald-400">
          {usageExportMessage}
        </p>
      )}
    </div>
  )
}
