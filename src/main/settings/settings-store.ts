import { app } from 'electron'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'

interface SettingsFile {
  openaiApiKey?: string
}

const settingsPath = (): string => join(app.getPath('userData'), 'settings.json')

async function readSettings(): Promise<SettingsFile> {
  try {
    const raw = await readFile(settingsPath(), 'utf-8')
    return JSON.parse(raw) as SettingsFile
  } catch {
    return {}
  }
}

async function writeSettings(data: SettingsFile): Promise<void> {
  const path = settingsPath()
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8')
}

export function maskApiKey(key: string): string {
  const trimmed = key.trim()
  if (trimmed.length <= 8) return '…'
  return `…${trimmed.slice(-4)}`
}

export async function getOpenAiKey(): Promise<string | null> {
  const settings = await readSettings()
  const key = settings.openaiApiKey?.trim()
  return key || null
}

export async function getOpenAiStatus(): Promise<{ configured: boolean; maskedKey?: string }> {
  const key = await getOpenAiKey()
  if (!key) return { configured: false }
  return { configured: true, maskedKey: maskApiKey(key) }
}

export async function setOpenAiKey(apiKey: string): Promise<void> {
  const trimmed = apiKey.trim()
  if (!trimmed) throw new Error('API key cannot be empty')
  const settings = await readSettings()
  settings.openaiApiKey = trimmed
  await writeSettings(settings)
}

export async function clearOpenAiKey(): Promise<void> {
  const settings = await readSettings()
  delete settings.openaiApiKey
  await writeSettings(settings)
}
