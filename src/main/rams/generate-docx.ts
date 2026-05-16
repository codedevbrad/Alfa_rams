import PizZip from 'pizzip'
import { readFile } from 'fs/promises'
import type { GenerateDocxPayload } from '../../shared/rams/generate-payload'
import { toTemplateData } from '../../shared/rams/document'
import { getWordFontName, isPreviewFontId } from '../../shared/rams/preview-fonts'
import { applyFontToDocxZip } from './apply-docx-font'
import { buildDocumentXml } from './build-document-xml'
import { getTemplateDocxPath } from './template-loader'

const PREPARED_BY = process.env.RAMS_PREPARED_BY ?? 'ALFA Industrial Services Ltd'

export async function generateDocx(payload: GenerateDocxPayload): Promise<Buffer> {
  const { document } = payload
  const fontId = isPreviewFontId(payload.fontId) ? payload.fontId : 'template'

  const templatePath = getTemplateDocxPath(document.templateId)
  const content = await readFile(templatePath)
  const zip = new PizZip(content)

  const data = toTemplateData(document, PREPARED_BY)
  zip.file('word/document.xml', buildDocumentXml(data))

  const wordFont = getWordFontName(fontId)
  if (wordFont) {
    applyFontToDocxZip(zip, wordFont)
  }

  return Buffer.from(zip.generate({ type: 'nodebuffer' }))
}

export function getPreparedBy(): string {
  return PREPARED_BY
}
