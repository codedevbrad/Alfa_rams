import { ipcMain } from 'electron'
import type { AnalyzeInboxInput, DraftReplyInput, SendReplyInput } from '@shared/email/inbox'
import type { UpsertEmailSenderInput } from '@shared/email/senders'
import {
  deleteEmailSender,
  listEmailSenders,
  upsertEmailSender
} from '../db/email/email-service'
import {
  analyzeInboxMessage,
  applyDefaultMonitorLabel,
  connectGmail,
  disconnectGmail,
  draftReply,
  getEmailAnalytics,
  getGmailStatus,
  getInboxMessage,
  listInbox,
  listUserLabels,
  markInboxFulfilled,
  sendInboxReply,
  setMonitoredLabel
} from './inbox/inbox-service'

export function registerEmailIpcHandlers(): void {
  ipcMain.handle('email:list-senders', () => listEmailSenders())
  ipcMain.handle('email:upsert-sender', (_event, input: UpsertEmailSenderInput) =>
    upsertEmailSender(input)
  )
  ipcMain.handle('email:delete-sender', (_event, id: number) => deleteEmailSender(id))

  ipcMain.handle('email:gmail-status', () => getGmailStatus())
  ipcMain.handle('email:gmail-connect', async () => {
    await connectGmail()
    await applyDefaultMonitorLabel()
  })
  ipcMain.handle('email:gmail-disconnect', () => disconnectGmail())
  ipcMain.handle('email:list-gmail-labels', () => listUserLabels())
  ipcMain.handle('email:set-gmail-label', (_event, labelId: string) => {
    if (typeof labelId !== 'string' || !labelId.trim()) {
      throw new Error('Invalid label id')
    }
    return setMonitoredLabel(labelId)
  })

  ipcMain.handle('email:list-inbox', () => listInbox())
  ipcMain.handle('email:get-inbox-message', (_event, gmailMessageId: string) => {
    if (typeof gmailMessageId !== 'string' || !gmailMessageId.trim()) {
      throw new Error('Invalid message id')
    }
    return getInboxMessage(gmailMessageId)
  })
  ipcMain.handle('email:analyze-inbox', (_event, input: AnalyzeInboxInput) => {
    if (!input || typeof input.gmailMessageId !== 'string') {
      throw new Error('Invalid analyze input')
    }
    return analyzeInboxMessage(input)
  })
  ipcMain.handle('email:draft-inbox-reply', (_event, input: DraftReplyInput) => {
    if (!input || typeof input.gmailMessageId !== 'string') {
      throw new Error('Invalid draft input')
    }
    return draftReply(input)
  })
  ipcMain.handle('email:send-inbox-reply', (_event, input: SendReplyInput) => {
    if (
      !input ||
      typeof input.gmailMessageId !== 'string' ||
      typeof input.body !== 'string' ||
      (input.senderId != null && typeof input.senderId !== 'number')
    ) {
      throw new Error('Invalid send input')
    }
    return sendInboxReply(input)
  })
  ipcMain.handle('email:mark-inbox-fulfilled', (_event, gmailMessageId: string) => {
    if (typeof gmailMessageId !== 'string' || !gmailMessageId.trim()) {
      throw new Error('Invalid message id')
    }
    return markInboxFulfilled(gmailMessageId)
  })

  ipcMain.handle('email:get-analytics', () => getEmailAnalytics())
}
