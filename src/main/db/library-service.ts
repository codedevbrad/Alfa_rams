import type {
  ActivityCategoryDto,
  ActivityHazardDto,
  PpeCategoryGroupDto,
  PpeItemDto,
  UpsertActivityCategoryInput,
  UpsertActivityHazardInput,
  UpsertPpeGroupInput,
  UpsertPpeItemInput
} from '@shared/rams/library'
import { withComputedRisks } from '@shared/rams/risk'
import type { ActivityHazard, PpeItem as PpeItemRecord } from '../../generated/prisma/client'
import { getPrisma } from './client'

function mapHazard(row: ActivityHazard): ActivityHazardDto {
  return withComputedRisks({
    id: row.id,
    categoryId: row.categoryId,
    sortOrder: row.sortOrder,
    activity: row.activity,
    hazard: row.hazard,
    likelihood: row.likelihood,
    severity: row.severity,
    who: row.who,
    controls: row.controls,
    residualLikelihood: row.residualLikelihood,
    residualSeverity: row.residualSeverity,
    residualWho: row.residualWho,
    monitoring: row.monitoring
  }) as ActivityHazardDto
}

function mapPpeItem(row: PpeItemRecord): PpeItemDto {
  return {
    id: row.id,
    groupId: row.groupId,
    sortOrder: row.sortOrder,
    category: row.category,
    requirement: row.requirement
  }
}

export async function listActivityCategories(): Promise<ActivityCategoryDto[]> {
  const categories = await getPrisma().activityCategory.findMany({
    include: { hazards: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' }
  })

  return categories.map((category) => ({
    id: category.id,
    category: category.name,
    sortOrder: category.sortOrder,
    hazards: category.hazards.map(mapHazard)
  }))
}

export async function listPpeCategories(): Promise<PpeCategoryGroupDto[]> {
  const groups = await getPrisma().ppeGroup.findMany({
    include: { items: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' }
  })

  return groups.map((group) => ({
    id: group.id,
    group: group.name,
    sortOrder: group.sortOrder,
    items: group.items.map(mapPpeItem)
  }))
}

export async function upsertActivityCategory(
  input: UpsertActivityCategoryInput
): Promise<ActivityCategoryDto> {
  const prisma = getPrisma()
  const row = input.id
    ? await prisma.activityCategory.update({
        where: { id: input.id },
        data: { name: input.name, sortOrder: input.sortOrder ?? 0 }
      })
    : await prisma.activityCategory.create({
        data: { name: input.name, sortOrder: input.sortOrder ?? 0 }
      })

  return {
    id: row.id,
    category: row.name,
    sortOrder: row.sortOrder,
    hazards: []
  }
}

export async function deleteActivityCategory(id: number): Promise<void> {
  await getPrisma().activityCategory.delete({ where: { id } })
}

export async function upsertActivityHazard(
  input: UpsertActivityHazardInput
): Promise<ActivityHazardDto> {
  const prisma = getPrisma()
  const data = {
    categoryId: input.categoryId,
    activity: input.activity,
    hazard: input.hazard,
    likelihood: input.likelihood,
    severity: input.severity,
    who: input.who,
    controls: input.controls,
    residualLikelihood: input.residualLikelihood,
    residualSeverity: input.residualSeverity,
    residualWho: input.residualWho,
    monitoring: input.monitoring,
    sortOrder: input.sortOrder ?? 0
  }

  const row = input.id
    ? await prisma.activityHazard.update({ where: { id: input.id }, data })
    : await prisma.activityHazard.create({ data })

  return mapHazard(row)
}

export async function deleteActivityHazard(id: number): Promise<void> {
  await getPrisma().activityHazard.delete({ where: { id } })
}

export async function upsertPpeGroup(input: UpsertPpeGroupInput): Promise<PpeCategoryGroupDto> {
  const prisma = getPrisma()
  const row = input.id
    ? await prisma.ppeGroup.update({
        where: { id: input.id },
        data: { name: input.name, sortOrder: input.sortOrder ?? 0 }
      })
    : await prisma.ppeGroup.create({
        data: { name: input.name, sortOrder: input.sortOrder ?? 0 }
      })

  return {
    id: row.id,
    group: row.name,
    sortOrder: row.sortOrder,
    items: []
  }
}

export async function deletePpeGroup(id: number): Promise<void> {
  await getPrisma().ppeGroup.delete({ where: { id } })
}

export async function upsertPpeItem(input: UpsertPpeItemInput): Promise<PpeItemDto> {
  const prisma = getPrisma()
  const data = {
    groupId: input.groupId,
    category: input.category,
    requirement: input.requirement,
    sortOrder: input.sortOrder ?? 0
  }

  const row = input.id
    ? await prisma.ppeItem.update({ where: { id: input.id }, data })
    : await prisma.ppeItem.create({ data })

  return mapPpeItem(row)
}

export async function deletePpeItem(id: number): Promise<void> {
  await getPrisma().ppeItem.delete({ where: { id } })
}
