import { randomUUID } from 'crypto'
import { app } from 'electron'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import type {
  AiGenerationUsageRecord,
  AiUsageApiCall,
  AiUsageListResult,
  AiUsagePeriodTotals,
  AiUsageTotals
} from '../../shared/rams/ai-usage'
import { buildAiUsageCsv, emptyUsageTotals } from '../../shared/rams/ai-usage'

const MAX_RECORDS = 500
const DEFAULT_LIST_LIMIT = 100

interface AiUsageLogFile {
  records: AiGenerationUsageRecord[]
}

const logPath = (): string => join(app.getPath('userData'), 'ai-usage-log.json')

async function readLog(): Promise<AiUsageLogFile> {
  try {
    const raw = await readFile(logPath(), 'utf-8')
    const parsed = JSON.parse(raw) as AiUsageLogFile
    if (!Array.isArray(parsed.records)) return { records: [] }
    return parsed
  } catch {
    return { records: [] }
  }
}

async function writeLog(data: AiUsageLogFile): Promise<void> {
  const path = logPath()
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8')
}

function periodTotals(records: AiGenerationUsageRecord[]): AiUsagePeriodTotals {
  const base = emptyUsageTotals()
  return records.reduce<AiUsagePeriodTotals>(
    (acc, record) => ({
      generationCount: acc.generationCount + 1,
      promptTokens: acc.promptTokens + record.totals.promptTokens,
      completionTokens: acc.completionTokens + record.totals.completionTokens,
      totalTokens: acc.totalTokens + record.totals.totalTokens,
      estimatedCostUsd: acc.estimatedCostUsd + record.totals.estimatedCostUsd
    }),
    { ...base, generationCount: 0 }
  )
}

function recordsForCurrentMonth(records: AiGenerationUsageRecord[]): AiGenerationUsageRecord[] {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  return records.filter((r) => new Date(r.timestamp) >= monthStart)
}

export interface AppendGenerationInput {
  projectName: string
  templateId: string
  success: boolean
  errorMessage?: string
  apiCalls: AiUsageApiCall[]
}

export async function appendGenerationRecord(
  input: AppendGenerationInput
): Promise<AiGenerationUsageRecord> {
  const totals: AiUsageTotals = input.apiCalls.reduce(
    (acc, call) => ({
      promptTokens: acc.promptTokens + call.promptTokens,
      completionTokens: acc.completionTokens + call.completionTokens,
      totalTokens: acc.totalTokens + call.totalTokens,
      estimatedCostUsd: acc.estimatedCostUsd + call.estimatedCostUsd
    }),
    emptyUsageTotals()
  )

  const record: AiGenerationUsageRecord = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    projectName: input.projectName,
    templateId: input.templateId,
    success: input.success,
    errorMessage: input.errorMessage,
    apiCalls: input.apiCalls,
    totals
  }

  const log = await readLog()
  log.records.unshift(record)
  if (log.records.length > MAX_RECORDS) {
    log.records = log.records.slice(0, MAX_RECORDS)
  }
  await writeLog(log)
  return record
}

export async function listAiUsageRecords(limit = DEFAULT_LIST_LIMIT): Promise<AiUsageListResult> {
  const log = await readLog()
  const all = log.records
  const monthRecords = recordsForCurrentMonth(all)

  return {
    records: all.slice(0, limit),
    allTime: periodTotals(all),
    month: periodTotals(monthRecords)
  }
}

export async function clearAiUsageLog(): Promise<void> {
  await writeLog({ records: [] })
}

export async function exportAiUsageCsv(): Promise<string> {
  const log = await readLog()
  return buildAiUsageCsv(log.records)
}
