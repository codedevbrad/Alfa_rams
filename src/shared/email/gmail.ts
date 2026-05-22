export const DEFAULT_GMAIL_MONITOR_LABEL = 'RAMS/pending'

export interface GmailLabelDto {
  id: string
  name: string
  type: string
}

export interface GmailStatusDto {
  connected: boolean
  labelConfigured: boolean
  gmailLabelName?: string
}
