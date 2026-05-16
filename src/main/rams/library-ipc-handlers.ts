import { ipcMain } from 'electron'
import type {
  UpsertActivityCategoryInput,
  UpsertActivityHazardInput,
  UpsertPpeGroupInput,
  UpsertPpeItemInput
} from '@shared/rams/library'
import {
  deleteActivityCategory,
  deleteActivityHazard,
  deletePpeGroup,
  deletePpeItem,
  listActivityCategories,
  listPpeCategories,
  upsertActivityCategory,
  upsertActivityHazard,
  upsertPpeGroup,
  upsertPpeItem
} from '../db/library-service'

export function registerLibraryIpcHandlers(): void {
  ipcMain.handle('rams:library:list-activities', () => listActivityCategories())
  ipcMain.handle('rams:library:list-ppe', () => listPpeCategories())

  ipcMain.handle('rams:library:upsert-activity-category', (_event, input: UpsertActivityCategoryInput) =>
    upsertActivityCategory(input)
  )
  ipcMain.handle('rams:library:delete-activity-category', (_event, id: number) =>
    deleteActivityCategory(id)
  )
  ipcMain.handle('rams:library:upsert-activity-hazard', (_event, input: UpsertActivityHazardInput) =>
    upsertActivityHazard(input)
  )
  ipcMain.handle('rams:library:delete-activity-hazard', (_event, id: number) =>
    deleteActivityHazard(id)
  )

  ipcMain.handle('rams:library:upsert-ppe-group', (_event, input: UpsertPpeGroupInput) =>
    upsertPpeGroup(input)
  )
  ipcMain.handle('rams:library:delete-ppe-group', (_event, id: number) => deletePpeGroup(id))
  ipcMain.handle('rams:library:upsert-ppe-item', (_event, input: UpsertPpeItemInput) =>
    upsertPpeItem(input)
  )
  ipcMain.handle('rams:library:delete-ppe-item', (_event, id: number) => deletePpeItem(id))
}
