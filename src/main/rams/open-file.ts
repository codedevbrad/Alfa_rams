import { shell } from 'electron'
import { existsSync } from 'fs'
import { spawn } from 'child_process'
import { normalize } from 'path'

export async function openFileInDefaultApp(filePath: string): Promise<void> {
  const normalized = normalize(filePath.trim())

  if (!normalized || !existsSync(normalized)) {
    throw new Error('File not found')
  }

  if (process.platform === 'win32') {
    await openOnWindows(normalized)
    return
  }

  const error = await shell.openPath(normalized)
  if (error) {
    throw new Error(error)
  }
}

function openOnWindows(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('cmd.exe', ['/c', 'start', '""', filePath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    })

    child.once('error', reject)
    child.unref()
    resolve()
  })
}
