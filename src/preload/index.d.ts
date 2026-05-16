import { ElectronAPI } from '@electron-toolkit/preload'
import type { RamsApi } from './rams-api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      rams: RamsApi
    }
  }
}

export {}
