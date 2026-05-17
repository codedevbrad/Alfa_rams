import OpenAI from 'openai'
import type {
  AiGeneratedRamsPayload,
  GenerateRamsAiInput,
  GenerateRamsAiResult,
  LibraryCatalogHazard,
  LibraryCatalogPpe
} from '../../shared/rams/ai-generate'
import { matchLibrarySelections } from '../../shared/rams/ai-library-match'
import { MIN_AI_ACTIVITIES, MIN_AI_PPE, RAMS_AI_MODEL } from '../../shared/rams/ai-generate'
import { RAMS_AI_RESPONSE_SCHEMA } from '../../shared/rams/ai-schema'
import type { AiUsageApiCall } from '../../shared/rams/ai-usage'
import { buildUsageSummary, usageFromOpenAi } from '../../shared/rams/ai-usage'
import { normalizeDocument } from '../../shared/rams/document'
import { withComputedRisks } from '../../shared/rams/risk'
import type { RamsDocument, RiskRow } from '../../shared/rams/types'
import { listActivityCategories, listPpeCategories } from '../db/library-service'
import { appendGenerationRecord } from '../settings/ai-usage-store'
import { getOpenAiKey } from '../settings/settings-store'
import { loadTemplateDefaults } from './template-loader'

const DEFAULT_TEMPLATE_ID = 'general-rams'

function todayUk(): string {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function reviewDateUk(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 6)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function buildLibraryCatalog(
  activities: Awaited<ReturnType<typeof listActivityCategories>>,
  ppe: Awaited<ReturnType<typeof listPpeCategories>>
): { hazards: LibraryCatalogHazard[]; ppe: LibraryCatalogPpe[] } {
  const hazards: LibraryCatalogHazard[] = []
  for (const cat of activities) {
    for (const h of cat.hazards) {
      hazards.push({
        id: h.id,
        category: cat.category,
        activity: h.activity,
        hazard: h.hazard,
        likelihood: h.likelihood,
        severity: h.severity,
        who: h.who,
        controls: h.controls,
        residualLikelihood: h.residualLikelihood,
        residualSeverity: h.residualSeverity,
        residualWho: h.residualWho,
        monitoring: h.monitoring
      })
    }
  }

  const ppeItems: LibraryCatalogPpe[] = []
  for (const group of ppe) {
    for (const item of group.items) {
      ppeItems.push({ category: item.category, requirement: item.requirement })
    }
  }

  return { hazards, ppe: ppeItems }
}

function riskRowFromAi(row: Omit<RiskRow, 'risk' | 'residualRisk'>): RiskRow {
  return withComputedRisks({
    ...row,
    risk: 1,
    residualRisk: 1
  })
}

function mergeAiDocument(base: RamsDocument, ai: AiGeneratedRamsPayload): RamsDocument {
  const rows = ai.riskAssessment.rows.map((row) => riskRowFromAi(row as Omit<RiskRow, 'risk' | 'residualRisk'>))

  return normalizeDocument({
    templateId: base.templateId,
    cover: {
      ...base.cover,
      ...ai.cover,
      projectTitle: ai.cover.projectTitle.trim() || base.cover.projectTitle
    },
    activities: ai.activities.length ? ai.activities : base.activities,
    methodStatement: { ...base.methodStatement, ...ai.methodStatement },
    hotWork: { ...base.hotWork, ...ai.hotWork },
    ppeItems: ai.ppeItems.length ? ai.ppeItems : base.ppeItems,
    rescuePlan: { ...base.rescuePlan, ...ai.rescuePlan },
    riskAssessment: {
      ...base.riskAssessment,
      ...ai.riskAssessment,
      rows: rows.length ? rows : base.riskAssessment.rows
    },
    signOff: {
      ...base.signOff,
      ...ai.signOff,
      rows: ai.signOff.rows.length ? ai.signOff.rows : base.signOff.rows
    }
  })
}

function validateAiPayload(payload: AiGeneratedRamsPayload): void {
  if (!payload.cover?.projectTitle?.trim()) {
    throw new Error('AI response missing project title')
  }
  const activityCount = payload.activities?.filter((a) => a.trim()).length ?? 0
  if (activityCount < MIN_AI_ACTIVITIES) {
    throw new Error(`AI response must include at least ${MIN_AI_ACTIVITIES} activities`)
  }
  const ppeCount = payload.ppeItems?.filter((p) => p.category.trim() || p.requirement.trim()).length ?? 0
  if (ppeCount < MIN_AI_PPE) {
    throw new Error(`AI response must include at least ${MIN_AI_PPE} PPE items`)
  }
  if (!payload.riskAssessment?.rows?.length) {
    throw new Error('AI response missing risk assessment rows')
  }
  for (const row of payload.riskAssessment.rows) {
    if (row.likelihood < 1 || row.likelihood > 5 || row.severity < 1 || row.severity > 5) {
      throw new Error('Invalid risk scores in AI response')
    }
  }
}

function buildSystemPrompt(): string {
  return `You are a UK construction health and safety specialist writing RAMS (Risk Assessment and Method Statement) documents.

Rules:
- Use professional UK construction RAMS language.
- Prefer risk rows copied from the hazard library (match activity, hazard, scores, controls) and adapt only when the job requires it.
- Prefer PPE items from the library (exact category and requirement strings where possible).
- Include all method statement sections with substantive content for the described work.
- Fill hot work sections only if hot work is relevant; otherwise use brief "Not applicable" style text.
- Set riskAssessment.assessorName to "TBC".
- Use UK date format DD/MM/YYYY for cover dates, assessment dates, and sign-off.
- activities: list each distinct activity / persons involved as separate strings. You MUST include at least ${MIN_AI_ACTIVITIES} non-empty activity entries.
- ppeItems: You MUST include at least ${MIN_AI_PPE} distinct PPE items from the library where possible.
- Include enough relevant risk assessment rows to cover the listed activities.`
}

function buildResult(
  merged: RamsDocument,
  catalog: { hazards: LibraryCatalogHazard[]; ppe: LibraryCatalogPpe[] }
): GenerateRamsAiResult {
  return {
    document: merged,
    librarySelections: matchLibrarySelections(merged, catalog.hazards, catalog.ppe)
  }
}

function applyProjectMeta(merged: RamsDocument, projectName: string): void {
  merged.cover.projectTitle = projectName
  if (!merged.cover.date.trim()) merged.cover.date = todayUk()
  if (!merged.cover.reviewDate.trim()) merged.cover.reviewDate = reviewDateUk()
  if (!merged.signOff.workDescription.trim()) {
    merged.signOff.workDescription = projectName
  }
}

async function persistUsageLog(input: {
  projectName: string
  templateId: string
  success: boolean
  errorMessage?: string
  apiCalls: AiUsageApiCall[]
}): Promise<string | null> {
  try {
    const record = await appendGenerationRecord(input)
    return record.id
  } catch (err) {
    console.error('Failed to append AI usage log:', err)
    return null
  }
}

export async function generateRamsWithAi(input: GenerateRamsAiInput): Promise<GenerateRamsAiResult> {
  const apiKey = await getOpenAiKey()
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Add your key in Settings.')
  }

  const templateId = input.templateId ?? DEFAULT_TEMPLATE_ID
  const [activities, ppe, base] = await Promise.all([
    listActivityCategories(),
    listPpeCategories(),
    loadTemplateDefaults(templateId)
  ])

  const catalog = buildLibraryCatalog(activities, ppe)
  const projectName = input.projectName.trim()
  const description = input.description.trim()

  if (!projectName) throw new Error('Project name is required')
  if (!description) throw new Error('Description is required')

  const userContent = JSON.stringify(
    {
      projectName,
      jobDescription: description,
      suggestedDates: { today: todayUk(), review: reviewDateUk() },
      hazardLibrary: catalog.hazards,
      ppeLibrary: catalog.ppe
    },
    null,
    0
  )

  const client = new OpenAI({ apiKey })
  const apiCalls: AiUsageApiCall[] = []

  const runCompletion = async (attempt: 1 | 2, extraUserMessage?: string): Promise<AiGeneratedRamsPayload> => {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: buildSystemPrompt() },
      {
        role: 'user',
        content: `Generate a complete RAMS document JSON for this job:\n${userContent}`
      }
    ]
    if (extraUserMessage) {
      messages.push({ role: 'user', content: extraUserMessage })
    }

    const completion = await client.chat.completions.create({
      model: RAMS_AI_MODEL,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'rams_document',
          strict: true,
          schema: RAMS_AI_RESPONSE_SCHEMA
        }
      }
    })

    apiCalls.push(usageFromOpenAi(RAMS_AI_MODEL, attempt, completion.usage))

    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error('OpenAI returned an empty response')

    const parsed = JSON.parse(raw) as AiGeneratedRamsPayload
    validateAiPayload(parsed)
    return parsed
  }

  try {
    const ai = await runCompletion(1)
    const merged = mergeAiDocument(base, ai)
    applyProjectMeta(merged, projectName)
    const recordId = await persistUsageLog({
      projectName,
      templateId,
      success: true,
      apiCalls
    })
    const result = buildResult(merged, catalog)
    if (recordId) {
      result.usage = buildUsageSummary(recordId, apiCalls)
    }
    return result
  } catch (firstErr) {
    try {
      const retryMessage = `The previous attempt failed validation. Return valid JSON matching the schema exactly. Include at least ${MIN_AI_ACTIVITIES} activities and at least ${MIN_AI_PPE} ppeItems.`
      const parsed = await runCompletion(2, retryMessage)
      const merged = mergeAiDocument(base, parsed)
      applyProjectMeta(merged, projectName)
      const recordId = await persistUsageLog({
        projectName,
        templateId,
        success: true,
        apiCalls
      })
      const result = buildResult(merged, catalog)
      if (recordId) {
        result.usage = buildUsageSummary(recordId, apiCalls)
      }
      return result
    } catch {
      const errorMessage =
        firstErr instanceof Error ? firstErr.message : 'RAMS generation failed. Please try again.'
      await persistUsageLog({
        projectName,
        templateId,
        success: false,
        errorMessage,
        apiCalls
      })
      if (firstErr instanceof Error) throw firstErr
      throw new Error(errorMessage)
    }
  }
}
