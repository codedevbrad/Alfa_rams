export {
  PREVIEW_FONTS,
  getPreviewFontOption,
  isPreviewFontId,
  type PreviewFontId,
  type PreviewFontOption
} from '@shared/rams/preview-fonts'

import { isPreviewFontId, type PreviewFontId } from '@shared/rams/preview-fonts'

export const PREVIEW_FONT_STORAGE_KEY = 'rams-preview-font'

export function loadStoredPreviewFontId(): PreviewFontId {
  try {
    const stored = localStorage.getItem(PREVIEW_FONT_STORAGE_KEY)
    if (stored && isPreviewFontId(stored)) return stored
  } catch {
    // ignore
  }
  return 'template'
}

export function storePreviewFontId(id: PreviewFontId): void {
  try {
    localStorage.setItem(PREVIEW_FONT_STORAGE_KEY, id)
  } catch {
    // ignore
  }
}
