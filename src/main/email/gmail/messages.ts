import type { InboxMessageDetail, InboxMessageSummary } from '@shared/email/inbox'

type GmailMessageSummary = Omit<InboxMessageSummary, 'workflowStatus'>
type GmailMessageDetail = Omit<InboxMessageDetail, 'workflowStatus'>
import { getGmailClient } from './oauth'
import { getMonitoredLabel } from './labels'

function headerValue(
  headers: { name?: string | null; value?: string | null }[] | undefined,
  name: string
): string | undefined {
  const h = headers?.find((x) => x.name?.toLowerCase() === name.toLowerCase())
  return h?.value ?? undefined
}

function parseFromEmail(from: string): string {
  const match = from.match(/<([^>]+)>/)
  if (match) return match[1].trim().toLowerCase()
  return from.trim().toLowerCase()
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normalized, 'base64').toString('utf-8')
}

function extractPlainBody(payload: {
  mimeType?: string | null
  body?: { data?: string | null }
  parts?: { mimeType?: string | null; body?: { data?: string | null }; parts?: unknown[] }[]
}): string {
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64Url(payload.body.data)
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractPlainBody(part as typeof payload)
      if (text) return text
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = decodeBase64Url(part.body.data)
        return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      }
    }
  }
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    const html = decodeBase64Url(payload.body.data)
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  return ''
}

function summaryFromMetadata(
  id: string,
  msg: {
    threadId?: string | null
    snippet?: string | null
    internalDate?: string | null
    payload?: { headers?: { name?: string | null; value?: string | null }[] }
  }
): GmailMessageSummary {
  const headers = msg.payload?.headers
  const from = headerValue(headers, 'From') ?? ''
  const subject = headerValue(headers, 'Subject') ?? '(no subject)'
  return {
    gmailMessageId: id,
    threadId: msg.threadId ?? undefined,
    from,
    fromEmail: parseFromEmail(from),
    subject,
    snippet: msg.snippet ?? '',
    internalDate: Number(msg.internalDate ?? 0)
  }
}

async function fetchSummariesForIds(ids: string[]): Promise<GmailMessageSummary[]> {
  const gmail = await getGmailClient()
  const summaries: GmailMessageSummary[] = []
  for (const id of ids) {
    const res = await gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'metadata',
      metadataHeaders: ['From', 'Subject']
    })
    if (res.data.id) {
      summaries.push(summaryFromMetadata(res.data.id, res.data))
    }
  }
  return summaries
}

export async function listMessageSummariesByLabel(options: {
  maxMessages: number
}): Promise<GmailMessageSummary[]> {
  const label = await getMonitoredLabel()
  if (!label) {
    throw new Error('No Gmail label selected. Choose a label on the Email dashboard.')
  }
  const gmail = await getGmailClient()
  const maxMessages = Math.max(1, options.maxMessages)
  const allIds: string[] = []
  let pageToken: string | undefined

  while (allIds.length < maxMessages) {
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      labelIds: [label.id],
      maxResults: Math.min(100, maxMessages - allIds.length),
      pageToken
    })
    const ids = (listRes.data.messages ?? [])
      .map((m) => m.id)
      .filter((id): id is string => Boolean(id))
    allIds.push(...ids)
    pageToken = listRes.data.nextPageToken ?? undefined
    if (!pageToken || ids.length === 0) break
  }

  const cappedIds = allIds.slice(0, maxMessages)
  const summaries = await fetchSummariesForIds(cappedIds)
  summaries.sort((a, b) => b.internalDate - a.internalDate)
  return summaries
}

export async function listMessagesByLabel(): Promise<GmailMessageSummary[]> {
  return listMessageSummariesByLabel({ maxMessages: 50 })
}

export async function getMessageDetail(gmailMessageId: string): Promise<GmailMessageDetail> {
  const gmail = await getGmailClient()
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: gmailMessageId,
    format: 'full'
  })
  if (!res.data.id) {
    throw new Error('Message not found')
  }
  const summary = summaryFromMetadata(res.data.id, res.data)
  const body = res.data.payload ? extractPlainBody(res.data.payload) : ''
  const headers = res.data.payload?.headers
  return {
    ...summary,
    body: body || res.data.snippet || '',
    messageIdHeader: headerValue(headers, 'Message-ID'),
    referencesHeader: headerValue(headers, 'References')
  }
}
