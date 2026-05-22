import { getGmailClient } from './oauth'

function replySubject(subject: string): string {
  const trimmed = subject.trim()
  if (/^re:/i.test(trimmed)) return trimmed
  return `Re: ${trimmed}`
}

function formatFromAddress(name: string, email: string): string {
  const needsQuotes = /[,<>"]/.test(name) || name !== name.trim()
  const escaped = name.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  if (needsQuotes) return `"${escaped}" <${email}>`
  return `${name} <${email}>`
}

function buildMimeMessage(input: {
  to: string
  subject: string
  body: string
  from?: string
  inReplyTo?: string
  references?: string
}): string {
  const lines: string[] = []
  if (input.from) lines.push(`From: ${input.from}`)
  lines.push(`To: ${input.to}`)
  lines.push(`Subject: ${input.subject}`)
  if (input.inReplyTo) lines.push(`In-Reply-To: ${input.inReplyTo}`)
  if (input.references) lines.push(`References: ${input.references}`)
  lines.push('MIME-Version: 1.0')
  lines.push('Content-Type: text/plain; charset=UTF-8')
  lines.push('Content-Transfer-Encoding: 8bit')
  lines.push('')
  lines.push(input.body)
  return lines.join('\r\n')
}

export async function sendGmailReply(input: {
  to: string
  subject: string
  body: string
  threadId?: string
  fromName?: string
  fromEmail?: string
  inReplyTo?: string
  references?: string
}): Promise<void> {
  const gmail = await getGmailClient()
  const from =
    input.fromName && input.fromEmail
      ? formatFromAddress(input.fromName, input.fromEmail)
      : undefined
  const mime = buildMimeMessage({
    to: input.to,
    subject: replySubject(input.subject),
    body: input.body,
    from,
    inReplyTo: input.inReplyTo,
    references: input.references
  })
  const raw = Buffer.from(mime, 'utf-8').toString('base64url')

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw,
      threadId: input.threadId
    }
  })
}
