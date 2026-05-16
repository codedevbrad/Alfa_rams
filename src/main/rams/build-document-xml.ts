import type { RamsTemplateData } from '../../shared/rams/types'
import {
  LIKELIHOOD_SCALE,
  PERSONS_EXPOSED_LEGEND,
  RISK_BAND_LEGEND,
  SEVERITY_SCALE
} from '../../shared/rams/measures'
import { riskBandFill } from '../../shared/rams/risk'
import {
  heading,
  paragraph,
  paragraphsFromText,
  spacerParagraph,
  table,
  tableCell,
  tableCellFromRuns,
  tableCellParagraph,
  tableRow
} from './ooxml'

const METHOD_STATEMENT_SECTIONS: {
  title: string
  body: (data: RamsTemplateData) => string
}[] = [
  { title: '1. Scope of Work', body: (d) => d.scopeOfWork },
  { title: '2. Responsibilities', body: (d) => d.responsibilities },
  { title: '3. Materials and Equipment', body: (d) => d.materialsAndEquipment },
  { title: '4. Health and Safety', body: (d) => d.healthAndSafety },
  { title: '5. Work Procedure', body: (d) => d.workProcedure },
  { title: '6. Environmental Considerations', body: (d) => d.environmentalConsiderations },
  { title: '7. Emergency Procedures', body: (d) => d.emergencyProcedures },
  { title: '8. Welfare Requirements', body: (d) => d.welfareRequirements },
  { title: '9. Lifting Equipment and MHE', body: (d) => d.liftingEquipment },
  { title: '10. Portable Appliance Testing (PAT)', body: (d) => d.pat },
  { title: '11. Confined Space', body: (d) => d.confinedSpaceNote },
  { title: '12. High-Risk Controls', body: (d) => d.highRiskControls }
]

function methodStatementTable(data: RamsTemplateData): string {
  const headerRow = tableRow([
    tableCellParagraph(paragraph('Statement of Method Used', true), 9000, undefined, 2)
  ])
  const sectionRows = METHOD_STATEMENT_SECTIONS.map(({ title, body }) =>
    tableRow([
      tableCellParagraph(paragraph(title, true), 3500),
      tableCellParagraph(paragraphsFromText(body(data) || ''), 5500)
    ])
  )
  return table([headerRow, ...sectionRows], 2)
}

const HOT_WORK_SECTIONS: {
  title: string
  body: (data: RamsTemplateData) => string
}[] = [
  { title: 'Prior to work commencement', body: (d) => d.hotWorkPrior },
  { title: 'Hazards', body: (d) => d.hotWorkHazards },
  { title: 'Harm', body: (d) => d.hotWorkHarm },
  { title: 'Control measures', body: (d) => d.hotWorkControls },
  { title: 'On completion', body: (d) => d.hotWorkCompletion }
]

function appendSpacedTable(parts: string[], tableXml: string): void {
  parts.push(spacerParagraph(280, 0))
  parts.push(tableXml)
  parts.push(spacerParagraph(0, 280))
}

function labeledSectionTable(title: string, body: string): string {
  return table(
    [
      tableRow([
        tableCellParagraph(paragraph(title.toUpperCase(), true), 3500),
        tableCellParagraph(paragraphsFromText(body || ''), 5500)
      ])
    ],
    2
  )
}

function ppeTable(data: RamsTemplateData): string {
  const rows = data.ppeItems.map((item) =>
    tableRow([tableCell(item.category, 3000), tableCell(item.requirement, 6000)])
  )
  if (!rows.length) return ''
  return table(
    [
      tableRow([
        tableCellParagraph(paragraph('Required PPE', true), 9000, undefined, 2)
      ]),
      ...rows
    ],
    2
  )
}

function rescuePlanTable(data: RamsTemplateData): string {
  const title = (data.rescuePlanTitle || 'Rescue plan').toUpperCase()
  return table(
    [
      tableRow([
        tableCellParagraph(paragraph(title, true), 9000, undefined, 2)
      ]),
      tableRow([
        tableCellParagraph(paragraphsFromText(data.rescuePlanBody || ''), 9000, undefined, 2)
      ])
    ],
    2
  )
}

function hotWorkHeaderTable(): string {
  return table(
    [tableRow([tableCellParagraph(paragraph('Hot Work', true), 9000, undefined, 2)])],
    2
  )
}

function activitiesTable(activitiesSummary: string): string {
  const lines = activitiesSummary
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const rightBody = lines.length
    ? lines.map((line) => paragraph(line, true)).join('')
    : paragraph('')

  return table(
    [
      tableRow([
        tableCell('Activity or task and the persons involved', 3500),
        tableCellParagraph(rightBody, 5500)
      ])
    ],
    2
  )
}

function riskScaleLegendRow(label: string, scale: { level: number; label: string }[]): string {
  return tableRow([
    tableCell(label, 1400),
    ...scale.map((item) => tableCell(`${item.level} = ${item.label}`, 1700))
  ])
}

function riskBandLegendCell(
  { range, band, action, color }: (typeof RISK_BAND_LEGEND)[number],
  widthTwips: number,
  gridSpan?: number
): string {
  return tableCellFromRuns(
    [
      { text: `${range} ` },
      { text: band, color },
      { text: `: ${action}` }
    ],
    widthTwips,
    undefined,
    gridSpan
  )
}

function riskAssessmentLegendTable(data: RamsTemplateData): string {
  return table(
    [
      tableRow([
        tableCell('Assessor (PLEASE PRINT)', 1600),
        tableCell(data.assessorName, 1600),
        tableCell('Date of assessment', 1600),
        tableCell(data.assessmentDate, 1200),
        tableCell('Date of reassessment', 1600),
        tableCell(data.reassessmentDate, 1200)
      ]),
      riskScaleLegendRow('Likelihood ( L )', LIKELIHOOD_SCALE),
      riskScaleLegendRow('Severity ( S )', SEVERITY_SCALE),
      tableRow([
        tableCell('Risk (R)', 1200),
        riskBandLegendCell(RISK_BAND_LEGEND[0], 1100),
        riskBandLegendCell(RISK_BAND_LEGEND[1], 2200, 2),
        riskBandLegendCell(RISK_BAND_LEGEND[2], 2200, 2)
      ]),
      tableRow([
        tableCell(PERSONS_EXPOSED_LEGEND[0], 1200),
        tableCell(PERSONS_EXPOSED_LEGEND[1], 1100),
        tableCell(PERSONS_EXPOSED_LEGEND[2], 2200, undefined, 2),
        tableCell(PERSONS_EXPOSED_LEGEND[3], 2200, undefined, 2)
      ])
    ],
    6
  )
}

function twoColTable(rows: [string, string][]): string {
  const trs = rows.map(([a, b]) => tableRow([tableCell(a, 3500), tableCell(b, 5500)]))
  return table(trs, 2)
}

export function buildDocumentXml(data: RamsTemplateData): string {
  const parts: string[] = []

  parts.push(paragraph('ALFA INDUSTRIAL SERVICES LTD', true))
  parts.push(paragraph('Method Statement and Risk Assessment', true))
  parts.push(paragraph(''))

  parts.push(twoColTable([
    ['Project Title', data.projectTitle],
    ['Location', data.location],
    ['Client', data.client],
    ['Date', data.date],
    ['Review Date', data.reviewDate],
    ['Prepared By', data.preparedBy]
  ]))

  appendSpacedTable(parts, activitiesTable(data.activitiesSummary || ''))
  appendSpacedTable(parts, methodStatementTable(data))

  const ppe = ppeTable(data)
  if (ppe) appendSpacedTable(parts, ppe)

  appendSpacedTable(parts, rescuePlanTable(data))
  appendSpacedTable(parts, hotWorkHeaderTable())
  for (const { title, body } of HOT_WORK_SECTIONS) {
    appendSpacedTable(parts, labeledSectionTable(title, body(data)))
  }

  parts.push(heading('Risk Assessment'))
  appendSpacedTable(parts, riskAssessmentLegendTable(data))

  const riskHeader = tableRow([
    tableCell('Activity', 1200),
    tableCell('Hazard', 1200),
    tableCell('L', 400),
    tableCell('S', 400),
    tableCell('R', 400),
    tableCell('Who', 500),
    tableCell('Controls', 1800),
    tableCell('L', 400),
    tableCell('S', 400),
    tableCell('R', 400),
    tableCell('Who', 500),
    tableCell('Monitoring', 1200)
  ])

  const riskRows = data.risks.map((row) =>
    tableRow([
      tableCell(row.activity, 1200),
      tableCell(row.hazard, 1200),
      tableCell(String(row.likelihood), 400),
      tableCell(String(row.severity), 400),
      tableCell(String(row.risk), 400, riskBandFill(row.risk)),
      tableCell(row.who, 500),
      tableCell(row.controls, 1800),
      tableCell(String(row.residualLikelihood), 400),
      tableCell(String(row.residualSeverity), 400),
      tableCell(String(row.residualRisk), 400, riskBandFill(row.residualRisk)),
      tableCell(row.residualWho, 500),
      tableCell(row.monitoring, 1200)
    ])
  )

  if (riskRows.length) {
    parts.push(table([riskHeader, ...riskRows], 12))
  }

  parts.push(heading('RAMS Sign-Off Sheet'))
  parts.push(
    twoColTable([
      ['Description of Work', data.workDescription],
      ['Job Reference', data.jobReference],
      ['Client', data.client],
      ['Site Address', data.siteAddress]
    ])
  )

  const signHeader = tableRow([
    tableCell('Name', 2000),
    tableCell('Signature', 2000),
    tableCell('Date', 1500),
    tableCell('Company', 2000),
    tableCell('Notes', 2000)
  ])
  const signRows = data.signOffRows.map((row) =>
    tableRow([
      tableCell(row.name, 2000),
      tableCell(row.signature, 2000),
      tableCell(row.date, 1500),
      tableCell(row.company, 2000),
      tableCell(row.notes, 2000)
    ])
  )
  parts.push(table([signHeader, ...signRows], 5))

  const body = parts.join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`
}
