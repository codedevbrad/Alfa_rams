import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildAiUsageCsv,
  estimateTokenCostUsd,
  formatCostUsd,
  formatTokens
} from './ai-usage'

describe('estimateTokenCostUsd', () => {
  it('computes gpt-4o-mini cost from per-million rates', () => {
    const cost = estimateTokenCostUsd('gpt-4o-mini', 1_000_000, 500_000)
    assert.equal(cost, 0.15 + 0.3)
  })

  it('returns 0 for unknown models', () => {
    assert.equal(estimateTokenCostUsd('unknown-model', 1000, 1000), 0)
  })
})

describe('buildAiUsageCsv', () => {
  it('escapes commas and quotes in project names', () => {
    const csv = buildAiUsageCsv([
      {
        id: '1',
        timestamp: '2026-05-17T12:00:00.000Z',
        projectName: 'Job, "Phase 1"',
        templateId: 'general-rams',
        success: true,
        apiCalls: [],
        totals: {
          promptTokens: 100,
          completionTokens: 200,
          totalTokens: 300,
          estimatedCostUsd: 0.001
        }
      }
    ])
    const lines = csv.split('\n')
    assert.equal(lines.length, 2)
    assert.match(lines[1], /"Job, ""Phase 1"""/)
  })
})

describe('format helpers', () => {
  it('formats thousands as k', () => {
    assert.equal(formatTokens(12_400), '12.4k')
  })

  it('shows rate unknown when pricing not known', () => {
    assert.equal(formatCostUsd(0.05, false), 'rate unknown')
  })
})
