/**
 * Builds template.docx from reference by injecting docxtemplater placeholders.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PizZip from 'pizzip'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const source = path.join(root, 'Procter and Gamble Thurrock Pipe Fitting RAMS V1.docx')

const replacements = [
  ['Beads Construction Project at Northfield and Southfield', '{projectTitle}'],
  ['P&G Thurrock Plant, Thurrock, UK', '{location}'],
  ['P&G', '{client}'],
  ['11/09/24', '{date}'],
  ['11/10/24', '{reviewDate}'],
  ['T. Humphries', '{preparedBy}'],
  ['T Humphries', '{assessorName}'],
  ['Pipefitting for Process Pipework at P&G Thurrock Plant', '{workDescription}'],
  ['PO 8005488874', '{jobReference}'],
  ['Procter and Gamble Thurrock', '{client}'],
  ['Procter & Gamble LtdHedley Ave, Grays RM20 4AL', '{siteAddress}']
]

/** @param {string} outDir */
function buildTemplate(outDir) {
  const buf = fs.readFileSync(source)
  const zip = new PizZip(buf)
  let xml = zip.file('word/document.xml').asText()

  for (const [from, to] of replacements) {
    if (xml.includes(from)) {
      xml = xml.split(from).join(to)
    }
  }

  // Mark first risk data row region for loop (simplified: inject loop tags before/after sample row text)
  const loopMarker = 'Hot Work – TIG Welding'
  if (xml.includes(loopMarker)) {
    xml = xml.replace(loopMarker, '{#risks}{activity}')
  }

  zip.file('word/document.xml', xml)
  const out = path.join(outDir, 'template.docx')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(out, zip.generate({ type: 'nodebuffer' }))
  console.log('Wrote', out)
}

buildTemplate(path.join(root, 'resources/templates/pg-thurrock-pipefitting'))
buildTemplate(path.join(root, 'resources/templates/general-rams'))
