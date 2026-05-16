import { app } from 'electron'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import type { RamsDocument, TemplateManifest } from '../../shared/rams/types'

const TEMPLATE_ID_PATTERN = /^[a-z0-9-]+$/

export function getTemplatesRoot(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'templates')
  }
  return join(app.getAppPath(), 'resources', 'templates')
}

function assertTemplateId(templateId: string): void {
  if (!TEMPLATE_ID_PATTERN.test(templateId)) {
    throw new Error(`Invalid template id: ${templateId}`)
  }
}

function templateDir(templateId: string): string {
  assertTemplateId(templateId)
  return join(getTemplatesRoot(), templateId)
}

export async function listTemplates(): Promise<TemplateManifest[]> {
  const root = getTemplatesRoot()
  const entries = await readdir(root, { withFileTypes: true })
  const manifests: TemplateManifest[] = []

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue
    const manifestPath = join(root, entry.name, 'manifest.json')
    try {
      const raw = await readFile(manifestPath, 'utf-8')
      const manifest = JSON.parse(raw) as TemplateManifest
      manifests.push(manifest)
    } catch {
      // skip invalid template folders
    }
  }

  return manifests.sort((a, b) => a.name.localeCompare(b.name))
}

export async function loadTemplateDefaults(templateId: string): Promise<RamsDocument> {
  const path = join(templateDir(templateId), 'defaults.json')
  const raw = await readFile(path, 'utf-8')
  const doc = JSON.parse(raw) as RamsDocument
  doc.templateId = templateId
  return doc
}

export function getTemplateDocxPath(templateId: string): string {
  return join(templateDir(templateId), 'template.docx')
}
