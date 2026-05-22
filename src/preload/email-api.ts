import { ipcRenderer } from 'electron'
import type { EmailAnalyticsDto } from '../shared/email/analytics'
import type { GmailLabelDto, GmailStatusDto } from '../shared/email/gmail'
import type {
  AnalyzeInboxInput,
  AnalyzeInboxResult,
  DraftReplyInput,
  DraftReplyResult,
  InboxMessageDetail,
  InboxMessageSummary,
  SendReplyInput
} from '../shared/email/inbox'
import type { EmailSenderDto, UpsertEmailSenderInput } from '../shared/email/senders'

export interface EmailApi {
  listEmailSenders: () => Promise<EmailSenderDto[]>
  upsertEmailSender: (input: UpsertEmailSenderInput) => Promise<EmailSenderDto>
  deleteEmailSender: (id: number) => Promise<void>
  getGmailStatus: () => Promise<GmailStatusDto>
  connectGmail: () => Promise<void>
  disconnectGmail: () => Promise<void>
  listGmailLabels: () => Promise<GmailLabelDto[]>
  setGmailLabel: (labelId: string) => Promise<GmailLabelDto>
  listInbox: () => Promise<InboxMessageSummary[]>
  getInboxMessage: (gmailMessageId: string) => Promise<InboxMessageDetail>
  analyzeInboxEmail: (input: AnalyzeInboxInput) => Promise<AnalyzeInboxResult>
  draftInboxReply: (input: DraftReplyInput) => Promise<DraftReplyResult>
  sendInboxReply: (input: SendReplyInput) => Promise<void>
  markInboxFulfilled: (gmailMessageId: string) => Promise<void>
  getEmailAnalytics: () => Promise<EmailAnalyticsDto>
}

export const emailApi: EmailApi = {
  listEmailSenders: () => ipcRenderer.invoke('email:list-senders'),
  upsertEmailSender: (input) => ipcRenderer.invoke('email:upsert-sender', input),
  deleteEmailSender: (id) => ipcRenderer.invoke('email:delete-sender', id),
  getGmailStatus: () => ipcRenderer.invoke('email:gmail-status'),
  connectGmail: () => ipcRenderer.invoke('email:gmail-connect'),
  disconnectGmail: () => ipcRenderer.invoke('email:gmail-disconnect'),
  listGmailLabels: () => ipcRenderer.invoke('email:list-gmail-labels'),
  setGmailLabel: (labelId) => ipcRenderer.invoke('email:set-gmail-label', labelId),
  listInbox: () => ipcRenderer.invoke('email:list-inbox'),
  getInboxMessage: (gmailMessageId) =>
    ipcRenderer.invoke('email:get-inbox-message', gmailMessageId),
  analyzeInboxEmail: (input) => ipcRenderer.invoke('email:analyze-inbox', input),
  draftInboxReply: (input) => ipcRenderer.invoke('email:draft-inbox-reply', input),
  sendInboxReply: (input) => ipcRenderer.invoke('email:send-inbox-reply', input),
  markInboxFulfilled: (gmailMessageId) =>
    ipcRenderer.invoke('email:mark-inbox-fulfilled', gmailMessageId),
  getEmailAnalytics: () => ipcRenderer.invoke('email:get-analytics')
}
