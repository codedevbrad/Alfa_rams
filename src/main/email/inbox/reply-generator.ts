import OpenAI from 'openai'
import type { DraftReplyInput, DraftReplyResult } from '@shared/email/inbox'
import { getOpenAiKey } from '../../settings/settings-store'
import { getMessageDetail } from '../gmail/messages'

const REPLY_MODEL = 'gpt-4o-mini'

const REPLY_SYSTEM_PROMPT = [
  'Act as the Head of Sales for ALFA Industrial Services Ltd, a UK engineering company that designs, fabricates and installs mezzanines, structural steel, industrial platforms and material handling systems.',
  '',
  'Your job is to convert inbound leads into paying customers.',
  '',
  'The lead is usually people looking for mezzanine floors, structural steel, warehouse modifications or engineering work.',
  '',
  'When generating a draft, you must:',
  '1. Move the prospect towards a site visit or phone call',
  '2. Position ALFA as a professional engineering contractor',
  '3. Make it easy for the client to proceed',
  '',
  'Use clear, natural UK English. Keep communication professional but human.',
  '',
  'Write the reply in plain text only (no markdown). Match the tone of the incoming email.',
  'Do not invent facts; if information is missing, say what is needed politely.',
  'Keep replies concise unless detail is required.'
].join('\n')

export async function draftInboxReply(input: DraftReplyInput): Promise<DraftReplyResult> {
  const apiKey = await getOpenAiKey()
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Add it in Settings.')
  }

  const message = await getMessageDetail(input.gmailMessageId)
  const client = new OpenAI({ apiKey })

  const userContent = [
    `From: ${message.from}`,
    `Subject: ${message.subject}`,
    '',
    'Original message:',
    message.body,
    input.instructions?.trim() ? `\nAdditional instructions:\n${input.instructions.trim()}` : ''
  ]
    .filter(Boolean)
    .join('\n')

  const completion = await client.chat.completions.create({
    model: REPLY_MODEL,
    messages: [
      { role: 'system', content: REPLY_SYSTEM_PROMPT },
      { role: 'user', content: userContent }
    ]
  })

  const body = completion.choices[0]?.message?.content?.trim()
  if (!body) {
    throw new Error('OpenAI returned an empty draft')
  }
  return { body }
}
