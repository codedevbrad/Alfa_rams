import type { PpeItem, RiskRow } from './types'

export interface ActivityHazardDto extends RiskRow {
  id: number
  categoryId: number
  sortOrder: number
}

export interface ActivityCategoryDto {
  id: number
  category: string
  sortOrder: number
  hazards: ActivityHazardDto[]
}

export interface PpeItemDto extends PpeItem {
  id: number
  groupId: number
  sortOrder: number
}

export interface PpeCategoryGroupDto {
  id: number
  group: string
  sortOrder: number
  items: PpeItemDto[]
}

export interface UpsertActivityCategoryInput {
  id?: number
  name: string
  sortOrder?: number
}

export interface UpsertActivityHazardInput {
  id?: number
  categoryId: number
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
  sortOrder?: number
}

export interface UpsertPpeGroupInput {
  id?: number
  name: string
  sortOrder?: number
}

export interface UpsertPpeItemInput {
  id?: number
  groupId: number
  category: string
  requirement: string
  sortOrder?: number
}
