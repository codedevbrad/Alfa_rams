import OpenAI from 'openai'
import type {
  AnalyzeInboxInput,
  AnalyzeInboxResult,
  InboxEmailAnalysis
} from '@shared/email/inbox'
import { getOpenAiKey } from '../../settings/settings-store'
import { getMessageDetail } from '../gmail/messages'
import { INBOX_ANALYSIS_RESPONSE_SCHEMA } from './inbox-analysis-schema'

const ANALYSIS_MODEL = 'gpt-4o-mini'

function validateAnalysis(payload: InboxEmailAnalysis): void {
  if (!payload.summary?.trim()) throw new Error('Analysis missing summary')
  if (!payload.intent?.trim()) throw new Error('Analysis missing intent')
  if (!payload.suggestedReplyFocus?.trim()) throw new Error('Analysis missing suggested reply focus')
  if (!payload.likelyProjectType?.trim()) throw new Error('Analysis missing likely project type')
  if (!payload.estimatedProjectValueRange?.trim()) {
    throw new Error('Analysis missing estimated project value range')
  }
  if (!payload.recommendedNextAction?.trim()) {
    throw new Error('Analysis missing recommended next action')
  }
  if (!['low', 'medium', 'high'].includes(payload.urgency)) {
    throw new Error('Analysis has invalid urgency')
  }
  if (!['low', 'medium', 'high'].includes(payload.conversionProbability)) {
    throw new Error('Analysis has invalid conversion probability')
  }
}

export async function analyzeInboxEmail(input: AnalyzeInboxInput): Promise<AnalyzeInboxResult> {
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
    'Message body:',
    message.body
  ].join('\n')

  const completion = await client.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You analyse inbound emails for a UK construction RAMS (Risk Assessment and Method Statement) team. ' +
          'Classify intent, summarise facts stated in the email only, list missing information needed for RAMS or scheduling, ' +
          'and suggest what the reply should achieve. Do not invent site addresses, dates, or client details. ' +
          'Use plain language suitable for internal triage. ' +
          'Also provide a commercial assessment: likely project type (use "Unclear" if insufficient signal), ' +
          'estimated UK project value range in pounds (use cautious wording like "Unknown — …" when speculative), ' +
          'conversion probability (low/medium/high) from buyer intent, specificity, timeline, and budget signals, ' +
          'red flags (risks, vague scope, unrealistic timelines; empty array if none), and recommended next action ' +
          'for the RAMS team (call, site visit, questionnaire, etc. — broader than suggestedReplyFocus, which is email-reply-oriented).'
      },
      { role: 'user', content: userContent }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'inbox_email_analysis',
        strict: true,
        schema: INBOX_ANALYSIS_RESPONSE_SCHEMA
      }
    }
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) throw new Error('OpenAI returned an empty analysis')

  const analysis = JSON.parse(raw) as InboxEmailAnalysis
  validateAnalysis(analysis)
  return { analysis }
}
