import { ipcMain, dialog } from 'electron'
import { writeFile } from 'fs/promises'
import { clearOpenAiKey, getOpenAiStatus, setOpenAiKey } from './settings-store'
import {
  clearAiUsageLog,
  exportAiUsageCsv,
  listAiUsageRecords
} from './ai-usage-store'

export function registerSettingsIpcHandlers(): void {
  ipcMain.handle('rams:settings:get-openai-status', () => getOpenAiStatus())

  ipcMain.handle('rams:settings:set-openai-key', (_event, apiKey: string) => {
    if (typeof apiKey !== 'string') throw new Error('Invalid API key')
    return setOpenAiKey(apiKey)
  })

  ipcMain.handle('rams:settings:clear-openai-key', () => clearOpenAiKey())

  ipcMain.handle('rams:usage:list', (_event, limit?: number) => {
    if (limit !== undefined && (typeof limit !== 'number' || limit < 1)) {
      throw new Error('Invalid limit')
    }
    return listAiUsageRecords(limit)
  })

  ipcMain.handle('rams:usage:clear', () => clearAiUsageLog())

  ipcMain.handle('rams:usage:export-csv', async () => {
    const csv = await exportAiUsageCsv()
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export AI usage log',
      defaultPath: `ai-usage-${new Date().toISOString().slice(0, 10)}.csv`,
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })

    if (canceled || !filePath) {
      return { canceled: true as const }
    }

    await writeFile(filePath, csv, 'utf-8')
    return { canceled: false as const, filePath }
  })
}
