export interface TemplateManifest {
  id: string
  name: string
  description: string
  version: string
}

export interface PpeItem {
  category: string
  requirement: string
}

export interface RiskRow {
  activity: string
  hazard: string
  likelihood: number
  severity: number
  risk: number
  who: string
  controls: string
  residualLikelihood: number
  residualSeverity: number
  residualRisk: number
  residualWho: string
  monitoring: string
}

export interface SignOffRow {
  name: string
  signature: string
  date: string
  company: string
  notes: string
}

export interface RamsDocument {
  templateId: string
  cover: {
    projectTitle: string
    location: string
    client: string
    date: string
    reviewDate: string
  }
  activities: string[]
  methodStatement: {
    scopeOfWork: string
    responsibilities: string
    materialsAndEquipment: string
    healthAndSafety: string
    workProcedure: string
    environmentalConsiderations: string
    emergencyProcedures: string
    welfareRequirements: string
    liftingEquipment: string
    pat: string
    confinedSpaceNote: string
    highRiskControls: string
  }
  hotWork: {
    priorToWork: string
    hazards: string
    harm: string
    controlMeasures: string
    onCompletion: string
  }
  ppeItems: PpeItem[]
  rescuePlan: {
    title: string
    body: string
  }
  riskAssessment: {
    assessorName: string
    assessmentDate: string
    reassessmentDate: string
    rows: RiskRow[]
  }
  signOff: {
    workDescription: string
    jobReference: string
    client: string
    siteAddress: string
    rows: SignOffRow[]
  }
}

export type RamsSessionStatus = 'idle' | 'editing'

/** Flattened shape passed to docxtemplater */
export interface RamsTemplateData extends RamsDocument {
  preparedBy: string
  activitiesSummary: string
  scopeOfWork: string
  responsibilities: string
  materialsAndEquipment: string
  healthAndSafety: string
  workProcedure: string
  environmentalConsiderations: string
  emergencyProcedures: string
  welfareRequirements: string
  liftingEquipment: string
  pat: string
  confinedSpaceNote: string
  highRiskControls: string
  hotWorkPrior: string
  hotWorkHazards: string
  hotWorkHarm: string
  hotWorkControls: string
  hotWorkCompletion: string
  rescuePlanTitle: string
  rescuePlanBody: string
  projectTitle: string
  location: string
  client: string
  date: string
  reviewDate: string
  assessorName: string
  assessmentDate: string
  reassessmentDate: string
  workDescription: string
  jobReference: string
  siteAddress: string
  risks: RiskRow[]
  signOffRows: SignOffRow[]
}
