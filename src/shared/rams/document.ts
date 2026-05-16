import type { RamsDocument, RamsTemplateData } from './types'
import { withComputedRisks } from './risk'

export function cloneDocument(doc: RamsDocument): RamsDocument {
  return structuredClone(doc)
}

export function documentsEqual(a: RamsDocument | null, b: RamsDocument | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return JSON.stringify(normalizeDocument(a)) === JSON.stringify(normalizeDocument(b))
}

export function normalizeDocument(doc: RamsDocument): RamsDocument {
  return {
    ...doc,
    riskAssessment: {
      ...doc.riskAssessment,
      rows: doc.riskAssessment.rows.map((row) => withComputedRisks(row))
    }
  }
}

export function toTemplateData(doc: RamsDocument, preparedBy: string): RamsTemplateData {
  const normalized = normalizeDocument(doc)
  const m = normalized.methodStatement
  const h = normalized.hotWork
  return {
    ...normalized,
    preparedBy,
    activitiesSummary: normalized.activities.filter(Boolean).join('\n'),
    projectTitle: normalized.cover.projectTitle,
    location: normalized.cover.location,
    client: normalized.cover.client,
    date: normalized.cover.date,
    reviewDate: normalized.cover.reviewDate,
    scopeOfWork: m.scopeOfWork,
    responsibilities: m.responsibilities,
    materialsAndEquipment: m.materialsAndEquipment,
    healthAndSafety: m.healthAndSafety,
    workProcedure: m.workProcedure,
    environmentalConsiderations: m.environmentalConsiderations,
    emergencyProcedures: m.emergencyProcedures,
    welfareRequirements: m.welfareRequirements,
    liftingEquipment: m.liftingEquipment,
    pat: m.pat,
    confinedSpaceNote: m.confinedSpaceNote,
    highRiskControls: m.highRiskControls,
    hotWorkPrior: h.priorToWork,
    hotWorkHazards: h.hazards,
    hotWorkHarm: h.harm,
    hotWorkControls: h.controlMeasures,
    hotWorkCompletion: h.onCompletion,
    rescuePlanTitle: normalized.rescuePlan.title,
    rescuePlanBody: normalized.rescuePlan.body,
    assessorName: normalized.riskAssessment.assessorName,
    assessmentDate: normalized.riskAssessment.assessmentDate,
    reassessmentDate: normalized.riskAssessment.reassessmentDate,
    workDescription: normalized.signOff.workDescription,
    jobReference: normalized.signOff.jobReference,
    siteAddress: normalized.signOff.siteAddress,
    risks: normalized.riskAssessment.rows,
    signOffRows: normalized.signOff.rows
  }
}

export function createBlankSignOffRow(): RamsDocument['signOff']['rows'][number] {
  return { name: '', signature: '', date: '', company: '', notes: '' }
}

export function createBlankRiskRow(): RamsDocument['riskAssessment']['rows'][number] {
  return withComputedRisks({
    activity: '',
    hazard: '',
    likelihood: 1,
    severity: 1,
    risk: 1,
    who: '',
    controls: '',
    residualLikelihood: 1,
    residualSeverity: 1,
    residualRisk: 1,
    residualWho: '',
    monitoring: ''
  })
}

export function suggestedFileName(doc: RamsDocument): string {
  const client = doc.cover.client.replace(/[^\w\s-]/g, '').trim() || 'RAMS'
  const project = doc.cover.projectTitle.replace(/[^\w\s-]/g, '').trim() || 'document'
  return `${client}-${project}-RAMS.docx`.replace(/\s+/g, '-')
}
