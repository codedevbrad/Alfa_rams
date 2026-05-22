export type InboxWorkflowStatus = 'unopened' | 'opened' | 'fulfilled'

export function workflowStatusFromRecord(
  row: { openedAt: Date | null; fulfilledAt: Date | null } | null | undefined
): InboxWorkflowStatus {
  if (row?.fulfilledAt) return 'fulfilled'
  if (row?.openedAt) return 'opened'
  return 'unopened'
}

export interface InboxMessageSummary {
  gmailMessageId: string
  threadId?: string
  from: string
  fromEmail: string
  subject: string
  snippet: string
  internalDate: number
  workflowStatus: InboxWorkflowStatus
}

export interface InboxMessageDetail extends InboxMessageSummary {
  body: string
  messageIdHeader?: string
  referencesHeader?: string
}

export interface AnalyzeInboxInput {
  gmailMessageId: string
}

export interface InboxEmailAnalysis {
  summary: string
  intent: string
  keyPoints: string[]
  missingInformation: string[]
  suggestedReplyFocus: string
  urgency: 'low' | 'medium' | 'high'
  likelyProjectType: string
  estimatedProjectValueRange: string
  conversionProbability: 'low' | 'medium' | 'high'
  redFlags: string[]
  recommendedNextAction: string
}

export interface AnalyzeInboxResult {
  analysis: InboxEmailAnalysis
}

export function instructionsFromAnalysis(analysis: InboxEmailAnalysis): string {
  const lines = [
    `Project: ${analysis.likelyProjectType}`,
    `Value (estimate): ${analysis.estimatedProjectValueRange}`,
    `Next action: ${analysis.recommendedNextAction}`,
    `Reply focus: ${analysis.suggestedReplyFocus}`
  ]
  if (analysis.redFlags.length > 0) {
    lines.push(`Red flags: ${analysis.redFlags.join('; ')}`)
  }
  if (analysis.missingInformation.length > 0) {
    lines.push(`Address if needed: ${analysis.missingInformation.join('; ')}`)
  }
  return lines.join('\n')
}

export interface DraftReplyInput {
  gmailMessageId: string
  instructions?: string
}

export interface DraftReplyResult {
  body: string
}

export interface SendReplyInput {
  gmailMessageId: string
  body: string
  /** Optional; must be a Gmail “Send mail as” alias when set */
  senderId?: number
}
