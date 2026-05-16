import type { PreviewFontId } from './preview-fonts'
import type { RamsDocument } from './types'

export interface GenerateDocxPayload {
  document: RamsDocument
  fontId: PreviewFontId
}
