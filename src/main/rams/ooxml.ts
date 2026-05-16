export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export interface TextRun {
  text: string
  bold?: boolean
  color?: string
}

function runXml({ text, bold, color }: TextRun): string {
  const rPrParts: string[] = []
  if (bold) {
    rPrParts.push('<w:b/>', '<w:bCs/>')
  }
  if (color) {
    rPrParts.push(`<w:color w:val="${color}"/>`)
  }
  const rPr = rPrParts.length ? `<w:rPr>${rPrParts.join('')}</w:rPr>` : ''
  return `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`
}

export function paragraph(text: string, bold = false): string {
  return paragraphFromRuns([{ text, bold }])
}

export function paragraphFromRuns(runs: TextRun[]): string {
  return `<w:p>${runs.map(runXml).join('')}</w:p>`
}

export function paragraphsFromText(text: string, bold = false): string {
  const lines = text.split(/\r?\n/)
  if (lines.length === 0) return paragraph('', bold)
  return lines.map((line) => paragraph(line, bold)).join('')
}

export function heading(text: string): string {
  return `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
}

/** Empty paragraph with spacing before/after (twips; 240 ≈ 12pt). */
export function spacerParagraph(beforeTwips = 0, afterTwips = 0): string {
  const spacing =
    beforeTwips || afterTwips
      ? `<w:spacing w:before="${beforeTwips}" w:after="${afterTwips}"/>`
      : ''
  return `<w:p><w:pPr>${spacing}</w:pPr></w:p>`
}

function tableCellTcPr(widthTwips?: number, fill?: string, gridSpan?: number): string {
  const parts: string[] = []
  if (gridSpan && gridSpan > 1) {
    parts.push(`<w:gridSpan w:val="${gridSpan}"/>`)
  }
  if (widthTwips) {
    parts.push(`<w:tcW w:w="${widthTwips}" w:type="dxa"/>`)
  }
  if (fill) {
    parts.push(`<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>`)
  }
  return parts.length ? `<w:tcPr>${parts.join('')}</w:tcPr>` : '<w:tcPr/>'
}

export function tableCell(
  text: string,
  widthTwips?: number,
  fill?: string,
  gridSpan?: number
): string {
  return tableCellParagraph(paragraph(text), widthTwips, fill, gridSpan)
}

export function tableCellParagraph(
  content: string,
  widthTwips?: number,
  fill?: string,
  gridSpan?: number
): string {
  return `<w:tc>${tableCellTcPr(widthTwips, fill, gridSpan)}${content}</w:tc>`
}

export function tableCellFromRuns(
  runs: TextRun[],
  widthTwips?: number,
  fill?: string,
  gridSpan?: number
): string {
  return tableCellParagraph(paragraphFromRuns(runs), widthTwips, fill, gridSpan)
}

export function tableRow(cells: string[]): string {
  return `<w:tr>${cells.join('')}</w:tr>`
}

export function table(rows: string[], columnCount: number): string {
  const grid = Array.from({ length: columnCount }, () => '<w:gridCol w:w="900"/>').join('')
  return `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="5000" w:type="pct"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tblGrid>${grid}</w:tblGrid>
    ${rows.join('')}
  </w:tbl>`
}
