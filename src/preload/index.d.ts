import { ElectronAPI } from '@electron-toolkit/preload'
import type { EmailApi } from './email-api'
import type { RamsApi } from './rams-api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      rams: RamsApi
      email: EmailApi
    }
  }
}

export {}
