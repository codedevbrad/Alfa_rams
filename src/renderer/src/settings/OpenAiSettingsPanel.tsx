import { useState } from 'react'
import type { OpenAiStatus } from '@shared/rams/ai-generate'

interface OpenAiSettingsPanelProps {
  status: OpenAiStatus
  loading?: boolean
  onSaved: () => void
  onBack?: () => void
  compact?: boolean
  /** Renders as a section inside AiSettingsModal (no outer card / back button). */
  embedded?: boolean
}

export function OpenAiSettingsPanel({
  status,
  loading = false,
  onSaved,
  onBack,
  compact = false,
  embedded = false
}: OpenAiSettingsPanelProps): React.JSX.Element {
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      await window.api.rams.setOpenAiKey(apiKey)
      setApiKey('')
      setMessage('API key saved.')
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async (): Promise<void> => {
    if (!window.confirm('Remove the stored OpenAI API key?')) return
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      await window.api.rams.clearOpenAiKey()
      setApiKey('')
      setMessage('API key removed.')
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Clear failed')
    } finally {
      setSaving(false)
    }
  }

  const wrapperClass = embedded
    ? 'flex flex-col gap-4 px-5 py-5'
    : compact
      ? 'w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl'
      : 'w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl'

  return (
    <div className={wrapperClass}>
      <div className={embedded ? 'mb-4' : 'mb-4 flex items-start justify-between gap-3'}>
        <div>
          <h2
            className={
              embedded
                ? 'text-base font-semibold text-slate-100'
                : 'text-lg font-semibold text-slate-100'
            }
          >
            OpenAI settings
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Required for AI RAMS generation. Your key is stored locally on this device.
          </p>
        </div>
        {!embedded && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            Back
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-300">
            Status:{' '}
            {status.configured ? (
              <span className="text-emerald-400">
                Configured{status.maskedKey ? ` (${status.maskedKey})` : ''}
              </span>
            ) : (
              <span className="text-amber-400">Not configured</span>
            )}
          </p>

          <label className="block text-sm font-medium text-slate-300" htmlFor="openai-api-key">
            API key
          </label>
          <input
            id="openai-api-key"
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={status.configured ? 'Enter new key to replace' : 'sk-…'}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
          />

          {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            {status.configured && (
              <button
                type="button"
                onClick={() => void handleClear()}
                disabled={saving}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
              >
                Clear key
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !apiKey.trim()}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save key'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
