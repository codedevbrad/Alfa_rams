export function computeRisk(likelihood: number, severity: number): number {
  return likelihood * severity
}

export function riskBand(score: number): 'Low' | 'Medium' | 'High' {
  if (score <= 5) return 'Low'
  if (score <= 12) return 'Medium'
  return 'High'
}

const RISK_BAND_FILLS: Record<'Low' | 'Medium' | 'High', string> = {
  Low: 'C6EFCE',
  Medium: 'FFF2CC',
  High: 'FF0000'
}

export function riskBandFill(score: number): string {
  return RISK_BAND_FILLS[riskBand(score)]
}

export function withComputedRisks<
  T extends {
    likelihood: number
    severity: number
    residualLikelihood: number
    residualSeverity: number
  }
>(row: T): T & { risk: number; residualRisk: number } {
  return {
    ...row,
    risk: computeRisk(row.likelihood, row.severity),
    residualRisk: computeRisk(row.residualLikelihood, row.residualSeverity)
  }
}
