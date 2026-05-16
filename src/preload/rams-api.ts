import { ipcRenderer } from 'electron'
import type { GenerateDocxPayload } from '../shared/rams/generate-payload'
import type {
  ActivityCategoryDto,
  ActivityHazardDto,
  PpeCategoryGroupDto,
  PpeItemDto,
  UpsertActivityCategoryInput,
  UpsertActivityHazardInput,
  UpsertPpeGroupInput,
  UpsertPpeItemInput
} from '../shared/rams/library'
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
  listActivityCategories: () => Promise<ActivityCategoryDto[]>
  listPpeCategories: () => Promise<PpeCategoryGroupDto[]>
  upsertActivityCategory: (input: UpsertActivityCategoryInput) => Promise<ActivityCategoryDto>
  deleteActivityCategory: (id: number) => Promise<void>
  upsertActivityHazard: (input: UpsertActivityHazardInput) => Promise<ActivityHazardDto>
  deleteActivityHazard: (id: number) => Promise<void>
  upsertPpeGroup: (input: UpsertPpeGroupInput) => Promise<PpeCategoryGroupDto>
  deletePpeGroup: (id: number) => Promise<void>
  upsertPpeItem: (input: UpsertPpeItemInput) => Promise<PpeItemDto>
  deletePpeItem: (id: number) => Promise<void>
}

export const ramsApi: RamsApi = {
  listTemplates: () => ipcRenderer.invoke('rams:list-templates'),
  loadDefaults: (templateId) => ipcRenderer.invoke('rams:load-defaults', templateId),
  getPreparedBy: () => ipcRenderer.invoke('rams:get-prepared-by'),
  generateDocx: (payload) => ipcRenderer.invoke('rams:generate-docx', payload),
  saveDocx: (payload) => ipcRenderer.invoke('rams:save-docx', payload),
  openPath: (filePath) => ipcRenderer.invoke('rams:open-path', filePath),
  listActivityCategories: () => ipcRenderer.invoke('rams:library:list-activities'),
  listPpeCategories: () => ipcRenderer.invoke('rams:library:list-ppe'),
  upsertActivityCategory: (input) => ipcRenderer.invoke('rams:library:upsert-activity-category', input),
  deleteActivityCategory: (id) => ipcRenderer.invoke('rams:library:delete-activity-category', id),
  upsertActivityHazard: (input) => ipcRenderer.invoke('rams:library:upsert-activity-hazard', input),
  deleteActivityHazard: (id) => ipcRenderer.invoke('rams:library:delete-activity-hazard', id),
  upsertPpeGroup: (input) => ipcRenderer.invoke('rams:library:upsert-ppe-group', input),
  deletePpeGroup: (id) => ipcRenderer.invoke('rams:library:delete-ppe-group', id),
  upsertPpeItem: (input) => ipcRenderer.invoke('rams:library:upsert-ppe-item', input),
  deletePpeItem: (id) => ipcRenderer.invoke('rams:library:delete-ppe-item', id)
}
