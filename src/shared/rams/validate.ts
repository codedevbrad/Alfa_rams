import type { RamsDocument } from './types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateDocument(doc: RamsDocument): ValidationResult {
  const errors: string[] = []

  if (!doc.cover.projectTitle.trim()) errors.push('Project title is required')
  if (!doc.cover.client.trim()) errors.push('Client is required')
  if (!doc.cover.date.trim()) errors.push('Date is required')
  if (!doc.riskAssessment.rows.length) errors.push('At least one risk assessment row is required')
  if (!doc.riskAssessment.assessorName.trim()) errors.push('Assessor name is required')

  return { valid: errors.length === 0, errors }
}
