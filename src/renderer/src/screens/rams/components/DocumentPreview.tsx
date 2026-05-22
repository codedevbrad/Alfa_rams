import { useEffect, useRef } from 'react'
import { renderAsync } from 'docx-preview'
import { PREVIEW_FONTS, type PreviewFontId } from '../preview-fonts'

interface DocumentPreviewProps {
  buffer: ArrayBuffer | null
  error: string | null
  loading: boolean
  fontId: PreviewFontId
  onFontChange: (fontId: PreviewFontId) => void
}

export function DocumentPreview({
  buffer,
  error,
  loading,
  fontId,
  onFontChange
}: DocumentPreviewProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || !buffer) {
      if (el) el.innerHTML = ''
      return
    }

    el.innerHTML = ''
    renderAsync(buffer, el, undefined, {
      className: 'docx-preview',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false
    }).catch(() => {
      el.innerHTML = '<p class="p-4 text-red-400">Preview failed to render.</p>'
    })
  }, [buffer])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-950">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-700 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Preview</span>
        <label className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          <span className="whitespace-nowrap" title="Applied to the generated .docx and preview">
            Document font
          </span>
          <select
            value={fontId}
            onChange={(e) => onFontChange(e.target.value as PreviewFontId)}
            className="max-w-[11rem] rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-100"
            aria-label="Document font"
          >
            {PREVIEW_FONTS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="relative min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain p-2">
        {loading && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
            Regenerating document…
          </p>
        )}
        {error && !loading && <p className="p-4 text-sm text-red-400">{error}</p>}
        {!buffer && !loading && !error && (
          <p className="p-4 text-sm text-slate-500">Preview will appear here.</p>
        )}
        <div ref={containerRef} className="docx-container bg-white text-black" />
      </div>
    </div>
  )
}
