import type { PrismaClient } from '../../generated/prisma/client'

export interface SeedActivityCategory {
  category: string
  hazards: {
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
  }[]
}

export interface SeedPpeCategory {
  group: string
  items: { category: string; requirement: string }[]
}

export async function seedLibraryData(
  prisma: PrismaClient,
  data: {
    activityCategories: SeedActivityCategory[]
    ppeCategories: SeedPpeCategory[]
  }
): Promise<void> {
  await prisma.activityHazard.deleteMany()
  await prisma.activityCategory.deleteMany()
  await prisma.ppeItem.deleteMany()
  await prisma.ppeGroup.deleteMany()

  for (let categoryIndex = 0; categoryIndex < data.activityCategories.length; categoryIndex++) {
    const source = data.activityCategories[categoryIndex]
    const category = await prisma.activityCategory.create({
      data: {
        name: source.category,
        sortOrder: categoryIndex
      }
    })

    for (let hazardIndex = 0; hazardIndex < source.hazards.length; hazardIndex++) {
      const hazard = source.hazards[hazardIndex]
      await prisma.activityHazard.create({
        data: {
          categoryId: category.id,
          sortOrder: hazardIndex,
          activity: hazard.activity,
          hazard: hazard.hazard,
          likelihood: hazard.likelihood,
          severity: hazard.severity,
          who: hazard.who,
          controls: hazard.controls,
          residualLikelihood: hazard.residualLikelihood,
          residualSeverity: hazard.residualSeverity,
          residualWho: hazard.residualWho,
          monitoring: hazard.monitoring
        }
      })
    }
  }

  for (let groupIndex = 0; groupIndex < data.ppeCategories.length; groupIndex++) {
    const source = data.ppeCategories[groupIndex]
    const group = await prisma.ppeGroup.create({
      data: {
        name: source.group,
        sortOrder: groupIndex
      }
    })

    for (let itemIndex = 0; itemIndex < source.items.length; itemIndex++) {
      const item = source.items[itemIndex]
      await prisma.ppeItem.create({
        data: {
          groupId: group.id,
          sortOrder: itemIndex,
          category: item.category,
          requirement: item.requirement
        }
      })
    }
  }
}
