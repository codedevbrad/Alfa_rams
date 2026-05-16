import { readFile } from 'fs/promises'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaults = JSON.parse(
  await readFile(path.join(root, 'resources/templates/pg-thurrock-pipefitting/defaults.json'), 'utf-8')
)
const template = await readFile(
  path.join(root, 'resources/templates/pg-thurrock-pipefitting/template.docx')
)
const zip = new PizZip(template)
const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, nullGetter: () => '' })
const data = {
  ...defaults,
  preparedBy: 'ALFA Industrial Services Ltd',
  activitiesSummary: defaults.activities.join('\n'),
  projectTitle: defaults.cover.projectTitle,
  location: defaults.cover.location,
  client: defaults.cover.client,
  date: defaults.cover.date,
  reviewDate: defaults.cover.reviewDate,
  scopeOfWork: defaults.methodStatement.scopeOfWork,
  risks: defaults.riskAssessment.rows,
  signOffRows: defaults.signOff.rows
}
try {
  doc.render(data)
  const out = path.join(root, 'test-output.docx')
  await writeFile(out, doc.getZip().generate({ type: 'nodebuffer' }))
  console.log('OK', out)
} catch (e) {
  console.error('FAIL', e)
  process.exit(1)
}
