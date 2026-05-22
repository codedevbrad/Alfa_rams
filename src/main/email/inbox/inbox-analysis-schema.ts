/** JSON Schema for OpenAI structured inbox email analysis. */
export const INBOX_ANALYSIS_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'summary',
    'intent',
    'keyPoints',
    'missingInformation',
    'suggestedReplyFocus',
    'urgency',
    'likelyProjectType',
    'estimatedProjectValueRange',
    'conversionProbability',
    'redFlags',
    'recommendedNextAction'
  ],
  properties: {
    summary: { type: 'string' },
    intent: { type: 'string' },
    keyPoints: {
      type: 'array',
      items: { type: 'string' }
    },
    missingInformation: {
      type: 'array',
      items: { type: 'string' }
    },
    suggestedReplyFocus: { type: 'string' },
    urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
    likelyProjectType: { type: 'string' },
    estimatedProjectValueRange: { type: 'string' },
    conversionProbability: { type: 'string', enum: ['low', 'medium', 'high'] },
    redFlags: {
      type: 'array',
      items: { type: 'string' }
    },
    recommendedNextAction: { type: 'string' }
  }
} as const
