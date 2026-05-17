import type { PpeItem, RamsDocument, RiskRow } from './types'
import type { AiUsageSummary } from './ai-usage'

export const RAMS_AI_MODEL = 'gpt-4o-mini'

/** Minimum count of `activities` strings in AI-generated RAMS. */
export const MIN_AI_ACTIVITIES = 7

/** Minimum count of `ppeItems` in AI-generated RAMS. */
export const MIN_AI_PPE = 7

export interface MatchedLibraryHazard {
  id: number
  category: string
  activity: string
  hazard: string
}

export interface MatchedLibraryPpe {
  category: string
  requirement: string
}

export interface MatchedLibraryActivity {
  label: string
  category: string
}

export interface GeneratedRiskRowEntry {
  id: string
  row: RiskRow
  fromLibrary: boolean
  libraryHazardId?: number
  category: string
}

export interface GeneratedPpeEntry {
  id: string
  item: PpeItem
  fromLibrary: boolean
}

export interface AiLibrarySelections {
  activities: MatchedLibraryActivity[]
  hazards: MatchedLibraryHazard[]
  ppe: MatchedLibraryPpe[]
  customRiskRows: { activity: string; hazard: string }[]
  customPpe: PpeItem[]
  customActivities: string[]
  generatedRiskRows: GeneratedRiskRowEntry[]
  generatedPpeItems: GeneratedPpeEntry[]
}

export function buildAiLibrarySummaryText(selections: AiLibrarySelections): string {
  const libraryCount =
    selections.activities.length + selections.hazards.length + selections.ppe.length
  const customRisk = selections.customRiskRows.length
  const customPpe = selections.customPpe.length

  const parts: string[] = []
  if (libraryCount > 0) {
    parts.push(
      `${libraryCount} item${libraryCount === 1 ? '' : 's'} matched from your library`
    )
  }
  if (customRisk > 0 || customPpe > 0) {
    parts.push(
      `Additional AI-written content was added where no library match existed (${customRisk} risk row${customRisk === 1 ? '' : 's'}, ${customPpe} PPE item${customPpe === 1 ? '' : 's'})`
    )
  }
  if (parts.length === 0) {
    return 'AI generation complete. Review generated content in the document.'
  }
  return parts.join('. ') + '.'
}

export interface GenerateRamsAiResult {
  document: RamsDocument
  librarySelections: AiLibrarySelections
  usage?: AiUsageSummary
}

export interface GenerateRamsAiInput {
  projectName: string
  description: string
  templateId?: string
}

export interface OpenAiStatus {
  configured: boolean
  maskedKey?: string
}

export interface LibraryCatalogHazard {
  id: number
  category: string
  activity: string
  hazard: string
  likelihood: number
  severity: number
  who: string
  controls: string
  residualLikelihood: number
  residualSeverity: number
  residualWho: string
  monitoring: string
}

export interface LibraryCatalogPpe {
  category: string
  requirement: string
}

export type AiGeneratedRamsPayload = Omit<RamsDocument, 'templateId'>
