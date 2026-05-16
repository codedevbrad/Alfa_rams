import PizZip from 'pizzip'

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function buildRFontsTag(fontName: string): string {
  const name = escapeXmlAttr(fontName)
  return `<w:rFonts w:ascii="${name}" w:hAnsi="${name}" w:cs="${name}" w:eastAsia="${name}"/>`
}

function applyFontToXml(xml: string, fontName: string): string {
  const rFontsTag = buildRFontsTag(fontName)

  let result = xml.replace(/<w:rFonts\b[^>]*\/>/g, rFontsTag)
  result = result.replace(/<w:rFonts\b[^>]*>[\s\S]*?<\/w:rFonts>/g, rFontsTag)

  // Drop theme references so explicit font names take effect
  result = result.replace(/\s+w:asciiTheme="[^"]*"/g, '')
  result = result.replace(/\s+w:hAnsiTheme="[^"]*"/g, '')
  result = result.replace(/\s+w:cstheme="[^"]*"/g, '')
  result = result.replace(/\s+w:eastAsiaTheme="[^"]*"/g, '')

  return result
}

/** Rewrites fonts in all word/*.xml parts of a generated .docx */
export function applyFontToDocxZip(zip: PizZip, fontName: string): void {
  const tag = fontName.trim()
  if (!tag) return

  for (const path of Object.keys(zip.files)) {
    const entry = zip.files[path]
    if (!entry || entry.dir || !/^word\/.*\.xml$/i.test(path)) continue
    zip.file(path, applyFontToXml(entry.asText(), tag))
  }
}
