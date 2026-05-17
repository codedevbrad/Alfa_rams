import { MIN_AI_ACTIVITIES, MIN_AI_PPE } from './ai-generate'

/** JSON Schema for OpenAI structured output (RamsDocument without templateId). */
export const RAMS_AI_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'cover',
    'activities',
    'methodStatement',
    'hotWork',
    'ppeItems',
    'rescuePlan',
    'riskAssessment',
    'signOff'
  ],
  properties: {
    cover: {
      type: 'object',
      additionalProperties: false,
      required: ['projectTitle', 'location', 'client', 'date', 'reviewDate'],
      properties: {
        projectTitle: { type: 'string' },
        location: { type: 'string' },
        client: { type: 'string' },
        date: { type: 'string' },
        reviewDate: { type: 'string' }
      }
    },
    activities: {
      type: 'array',
      minItems: MIN_AI_ACTIVITIES,
      items: { type: 'string' }
    },
    methodStatement: {
      type: 'object',
      additionalProperties: false,
      required: [
        'scopeOfWork',
        'responsibilities',
        'materialsAndEquipment',
        'healthAndSafety',
        'workProcedure',
        'environmentalConsiderations',
        'emergencyProcedures',
        'welfareRequirements',
        'liftingEquipment',
        'pat',
        'confinedSpaceNote',
        'highRiskControls'
      ],
      properties: {
        scopeOfWork: { type: 'string' },
        responsibilities: { type: 'string' },
        materialsAndEquipment: { type: 'string' },
        healthAndSafety: { type: 'string' },
        workProcedure: { type: 'string' },
        environmentalConsiderations: { type: 'string' },
        emergencyProcedures: { type: 'string' },
        welfareRequirements: { type: 'string' },
        liftingEquipment: { type: 'string' },
        pat: { type: 'string' },
        confinedSpaceNote: { type: 'string' },
        highRiskControls: { type: 'string' }
      }
    },
    hotWork: {
      type: 'object',
      additionalProperties: false,
      required: ['priorToWork', 'hazards', 'harm', 'controlMeasures', 'onCompletion'],
      properties: {
        priorToWork: { type: 'string' },
        hazards: { type: 'string' },
        harm: { type: 'string' },
        controlMeasures: { type: 'string' },
        onCompletion: { type: 'string' }
      }
    },
    ppeItems: {
      type: 'array',
      minItems: MIN_AI_PPE,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['category', 'requirement'],
        properties: {
          category: { type: 'string' },
          requirement: { type: 'string' }
        }
      }
    },
    rescuePlan: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'body'],
      properties: {
        title: { type: 'string' },
        body: { type: 'string' }
      }
    },
    riskAssessment: {
      type: 'object',
      additionalProperties: false,
      required: ['assessorName', 'assessmentDate', 'reassessmentDate', 'rows'],
      properties: {
        assessorName: { type: 'string' },
        assessmentDate: { type: 'string' },
        reassessmentDate: { type: 'string' },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: [
              'activity',
              'hazard',
              'likelihood',
              'severity',
              'who',
              'controls',
              'residualLikelihood',
              'residualSeverity',
              'residualWho',
              'monitoring'
            ],
            properties: {
              activity: { type: 'string' },
              hazard: { type: 'string' },
              likelihood: { type: 'integer', minimum: 1, maximum: 5 },
              severity: { type: 'integer', minimum: 1, maximum: 5 },
              who: { type: 'string' },
              controls: { type: 'string' },
              residualLikelihood: { type: 'integer', minimum: 1, maximum: 5 },
              residualSeverity: { type: 'integer', minimum: 1, maximum: 5 },
              residualWho: { type: 'string' },
              monitoring: { type: 'string' }
            }
          }
        }
      }
    },
    signOff: {
      type: 'object',
      additionalProperties: false,
      required: ['workDescription', 'jobReference', 'client', 'siteAddress', 'rows'],
      properties: {
        workDescription: { type: 'string' },
        jobReference: { type: 'string' },
        client: { type: 'string' },
        siteAddress: { type: 'string' },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'signature', 'date', 'company', 'notes'],
            properties: {
              name: { type: 'string' },
              signature: { type: 'string' },
              date: { type: 'string' },
              company: { type: 'string' },
              notes: { type: 'string' }
            }
          }
        }
      }
    }
  }
} as const
