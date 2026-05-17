import { ipcMain, dialog } from 'electron'
import { writeFile } from 'fs/promises'
import type { GenerateDocxPayload } from '../../shared/rams/generate-payload'
import { generateDocx, getPreparedBy } from './generate-docx'
import { openFileInDefaultApp } from './open-file'
import { generateRamsWithAi } from './rams-ai-generator'
import { listTemplates, loadTemplateDefaults } from './template-loader'
import type { GenerateRamsAiInput } from '../../shared/rams/ai-generate'

function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '').trim() || 'RAMS.docx'
}

export function registerRamsIpcHandlers(): void {
  ipcMain.handle('rams:list-templates', () => listTemplates())

  ipcMain.handle('rams:load-defaults', (_event, templateId: string) =>
    loadTemplateDefaults(templateId)
  )

  ipcMain.handle('rams:get-prepared-by', () => getPreparedBy())

  ipcMain.handle('rams:generate-docx', async (_event, payload: GenerateDocxPayload) => {
    const buffer = await generateDocx(payload)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  })

  ipcMain.handle(
    'rams:save-docx',
    async (_event, payload: { buffer: ArrayBuffer; suggestedName: string }) => {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save RAMS document',
        defaultPath: sanitizeFileName(payload.suggestedName),
        filters: [{ name: 'Word Document', extensions: ['docx'] }]
      })

      if (canceled || !filePath) {
        return { canceled: true as const }
      }

      await writeFile(filePath, Buffer.from(payload.buffer))
      return { canceled: false as const, filePath }
    }
  )

  ipcMain.handle('rams:generate-with-ai', (_event, input: GenerateRamsAiInput) =>
    generateRamsWithAi(input)
  )

  ipcMain.handle('rams:open-path', async (_event, filePath: string) => {
    if (typeof filePath !== 'string') {
      throw new Error('Invalid file path')
    }
    await openFileInDefaultApp(filePath)
  })
}
