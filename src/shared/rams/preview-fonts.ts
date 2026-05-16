export type PreviewFontId =
  | 'template'
  | 'calibri'
  | 'arial'
  | 'times'
  | 'cambria'
  | 'georgia'
  | 'verdana'
  | 'tahoma'
  | 'garamond'
  | 'segoe'

export interface PreviewFontOption {
  id: PreviewFontId
  label: string
  /** OOXML font name written into the .docx; null keeps template fonts */
  wordFontName: string | null
}

export const PREVIEW_FONTS: PreviewFontOption[] = [
  { id: 'template', label: 'Template default', wordFontName: null },
  { id: 'calibri', label: 'Calibri', wordFontName: 'Calibri' },
  { id: 'arial', label: 'Arial', wordFontName: 'Arial' },
  { id: 'times', label: 'Times New Roman', wordFontName: 'Times New Roman' },
  { id: 'cambria', label: 'Cambria', wordFontName: 'Cambria' },
  { id: 'georgia', label: 'Georgia', wordFontName: 'Georgia' },
  { id: 'verdana', label: 'Verdana', wordFontName: 'Verdana' },
  { id: 'tahoma', label: 'Tahoma', wordFontName: 'Tahoma' },
  { id: 'garamond', label: 'Garamond', wordFontName: 'Garamond' },
  { id: 'segoe', label: 'Segoe UI', wordFontName: 'Segoe UI' }
]

export const PREVIEW_FONT_STORAGE_KEY = 'rams-preview-font'

export function getPreviewFontOption(id: PreviewFontId): PreviewFontOption {
  return PREVIEW_FONTS.find((f) => f.id === id) ?? PREVIEW_FONTS[0]
}

export function getWordFontName(id: PreviewFontId): string | null {
  return getPreviewFontOption(id).wordFontName
}

export function isPreviewFontId(value: string): value is PreviewFontId {
  return PREVIEW_FONTS.some((f) => f.id === value)
}
