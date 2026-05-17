import { RAMS_AI_MODEL } from './ai-generate'

/** USD per 1M tokens (input / output). Update when OpenAI changes list prices. */
export const MODEL_PRICING_PER_MILLION_USD: Record<
  string,
  { input: number; output: number }
> = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-2024-08-06': { input: 2.5, output: 10 }
}

export interface AiUsageApiCall {
  attempt: 1 | 2
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCostUsd: number
}

export interface AiUsageTotals {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCostUsd: number
}

export interface AiGenerationUsageRecord {
  id: string
  timestamp: string
  projectName: string
  templateId: string
  success: boolean
  errorMessage?: string
  apiCalls: AiUsageApiCall[]
  totals: AiUsageTotals
}

export interface AiUsageSummary extends AiUsageTotals {
  recordId: string
  apiCallCount: number
  pricingKnown: boolean
}

export interface AiUsagePeriodTotals extends AiUsageTotals {
  generationCount: number
}

export interface AiUsageListResult {
  records: AiGenerationUsageRecord[]
  allTime: AiUsagePeriodTotals
  month: AiUsagePeriodTotals
}

export function emptyUsageTotals(): AiUsageTotals {
  return {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    estimatedCostUsd: 0
  }
}

export function sumApiCalls(calls: AiUsageApiCall[]): AiUsageTotals {
  return calls.reduce(
    (acc, call) => ({
      promptTokens: acc.promptTokens + call.promptTokens,
      completionTokens: acc.completionTokens + call.completionTokens,
      totalTokens: acc.totalTokens + call.totalTokens,
      estimatedCostUsd: acc.estimatedCostUsd + call.estimatedCostUsd
    }),
    emptyUsageTotals()
  )
}

export function isPricingKnownForModel(model: string): boolean {
  return model in MODEL_PRICING_PER_MILLION_USD
}

export function estimateTokenCostUsd(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const rates = MODEL_PRICING_PER_MILLION_USD[model]
  if (!rates) return 0
  const inputCost = (promptTokens / 1_000_000) * rates.input
  const outputCost = (completionTokens / 1_000_000) * rates.output
  return inputCost + outputCost
}

export function usageFromOpenAi(
  model: string,
  attempt: 1 | 2,
  usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined
): AiUsageApiCall {
  const promptTokens = usage?.prompt_tokens ?? 0
  const completionTokens = usage?.completion_tokens ?? 0
  const totalTokens = usage?.total_tokens ?? promptTokens + completionTokens
  return {
    attempt,
    model,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostUsd: estimateTokenCostUsd(model, promptTokens, completionTokens)
  }
}

export function buildUsageSummary(
  recordId: string,
  apiCalls: AiUsageApiCall[]
): AiUsageSummary {
  const totals = sumApiCalls(apiCalls)
  const pricingKnown =
    apiCalls.length === 0 || apiCalls.every((c) => isPricingKnownForModel(c.model))
  return {
    recordId,
    ...totals,
    apiCallCount: apiCalls.length,
    pricingKnown
  }
}

export function formatTokens(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(2)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`
  return String(count)
}

export function formatCostUsd(amount: number, pricingKnown = true): string {
  if (!pricingKnown) return 'rate unknown'
  if (amount < 0.01 && amount > 0) return '<$0.01'
  return `$${amount.toFixed(amount < 1 ? 3 : 2)}`
}

export function formatUsageHint(summary: AiUsageSummary): string {
  const tokens = formatTokens(summary.totalTokens)
  const cost = formatCostUsd(summary.estimatedCostUsd, summary.pricingKnown)
  return `~${tokens} tokens · ~${cost} est.`
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

const CSV_HEADERS = [
  'Date',
  'Project',
  'Template',
  'Success',
  'Attempts',
  'Prompt tokens',
  'Completion tokens',
  'Total tokens',
  'Est. cost USD',
  'Error'
] as const

export function buildAiUsageCsv(records: AiGenerationUsageRecord[]): string {
  const lines = [CSV_HEADERS.join(',')]
  for (const record of records) {
    const date = new Date(record.timestamp).toLocaleString('en-GB')
    lines.push(
      [
        escapeCsvCell(date),
        escapeCsvCell(record.projectName),
        escapeCsvCell(record.templateId),
        record.success ? 'Yes' : 'No',
        String(record.apiCalls.length),
        String(record.totals.promptTokens),
        String(record.totals.completionTokens),
        String(record.totals.totalTokens),
        record.totals.estimatedCostUsd.toFixed(6),
        escapeCsvCell(record.errorMessage ?? '')
      ].join(',')
    )
  }
  return lines.join('\n')
}

export { RAMS_AI_MODEL }
