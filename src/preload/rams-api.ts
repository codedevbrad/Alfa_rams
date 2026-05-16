import { ipcRenderer } from 'electron'
import type { GenerateDocxPayload } from '../shared/rams/generate-payload'
import type { RamsDocument, TemplateManifest } from '../shared/rams/types'

export interface RamsApi {
  listTemplates: () => Promise<TemplateManifest[]>
  loadDefaults: (templateId: string) => Promise<RamsDocument>
  getPreparedBy: () => Promise<string>
  generateDocx: (payload: GenerateDocxPayload) => Promise<ArrayBuffer>
  saveDocx: (payload: {
    buffer: ArrayBuffer
    suggestedName: string
  }) => Promise<{ canceled: true } | { canceled: false; filePath: string }>
  openPath: (filePath: string) => Promise<void>
}

export const ramsApi: RamsApi = {
  listTemplates: () => ipcRenderer.invoke('rams:list-templates'),
  loadDefaults: (templateId) => ipcRenderer.invoke('rams:load-defaults', templateId),
  getPreparedBy: () => ipcRenderer.invoke('rams:get-prepared-by'),
  generateDocx: (payload) => ipcRenderer.invoke('rams:generate-docx', payload),
  saveDocx: (payload) => ipcRenderer.invoke('rams:save-docx', payload),
  openPath: (filePath) => ipcRenderer.invoke('rams:open-path', filePath)
}
