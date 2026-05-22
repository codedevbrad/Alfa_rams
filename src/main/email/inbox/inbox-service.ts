import type {
  AnalyzeInboxInput,
  AnalyzeInboxResult,
  DraftReplyInput,
  DraftReplyResult,
  InboxMessageDetail,
  InboxMessageSummary,
  SendReplyInput
} from '@shared/email/inbox'
import { workflowStatusFromRecord } from '@shared/email/inbox'
import type { GmailLabelDto, GmailStatusDto } from '@shared/email/gmail'
import { getEmailSenderById } from '../../db/email/email-service'
import {
  getInboundEmailByGmailIds,
  markInboundFulfilled,
  markInboundOpened,
  upsertInboundEmail
} from '../../db/email/inbound-email-service'
import { connectGmail, disconnectGmail, isGmailConnected } from '../gmail/oauth'
import {
  applyDefaultMonitorLabel,
  getMonitoredLabel,
  listUserLabels,
  setMonitoredLabel
} from '../gmail/labels'
import { getMessageDetail, listMessagesByLabel } from '../gmail/messages'
import { sendGmailReply } from '../gmail/send'
import { analyzeInboxEmail } from './email-analyzer'
import { draftInboxReply } from './reply-generator'

export async function getGmailStatus(): Promise<GmailStatusDto> {
  const connected = await isGmailConnected()
  const label = await getMonitoredLabel()
  return {
    connected,
    labelConfigured: Boolean(label),
    gmailLabelName: label?.name
  }
}

export async function listInbox(): Promise<InboxMessageSummary[]> {
  const summaries = await listMessagesByLabel()
  const inboundById = await getInboundEmailByGmailIds(summaries.map((m) => m.gmailMessageId))
  return summaries.map((m) => ({
    ...m,
    workflowStatus: workflowStatusFromRecord(inboundById.get(m.gmailMessageId))
  }))
}

export async function getInboxMessage(gmailMessageId: string): Promise<InboxMessageDetail> {
  const message = await getMessageDetail(gmailMessageId)
  const inbound = await markInboundOpened(gmailMessageId, {
    fromEmail: message.fromEmail,
    threadId: message.threadId,
    subject: message.subject
  })
  return {
    ...message,
    workflowStatus: workflowStatusFromRecord(inbound)
  }
}

export async function analyzeInboxMessage(input: AnalyzeInboxInput): Promise<AnalyzeInboxResult> {
  return analyzeInboxEmail(input)
}

export async function draftReply(input: DraftReplyInput): Promise<DraftReplyResult> {
  return draftInboxReply(input)
}

export async function sendInboxReply(input: SendReplyInput): Promise<void> {
  const message = await getMessageDetail(input.gmailMessageId)
  let fromName: string | undefined
  let fromEmail: string | undefined
  if (input.senderId != null) {
    const sender = await getEmailSenderById(input.senderId)
    fromName = sender.name
    fromEmail = sender.email
  }
  const references = message.referencesHeader
    ? `${message.referencesHeader} ${message.messageIdHeader ?? ''}`.trim()
    : message.messageIdHeader
  await sendGmailReply({
    to: message.fromEmail,
    subject: message.subject,
    body: input.body.trim(),
    threadId: message.threadId,
    fromName,
    fromEmail,
    inReplyTo: message.messageIdHeader,
    references
  })
  const now = new Date()
  await upsertInboundEmail({
    gmailMessageId: message.gmailMessageId,
    threadId: message.threadId,
    fromEmail: message.fromEmail,
    subject: message.subject,
    repliedAt: now,
    fulfilledAt: now
  })
}

export async function markInboxFulfilled(gmailMessageId: string): Promise<void> {
  const message = await getMessageDetail(gmailMessageId)
  await markInboundFulfilled(gmailMessageId, {
    fromEmail: message.fromEmail,
    threadId: message.threadId,
    subject: message.subject
  })
}

export { getEmailAnalytics } from './email-analytics-service'

export {
  connectGmail,
  disconnectGmail,
  listUserLabels,
  setMonitoredLabel,
  applyDefaultMonitorLabel
}

export type { GmailLabelDto }
