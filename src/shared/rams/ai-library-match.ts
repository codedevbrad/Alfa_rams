import type {
  LibraryCatalogHazard,
  LibraryCatalogPpe,
  MatchedLibraryActivity,
  MatchedLibraryHazard,
  MatchedLibraryPpe,
  GeneratedPpeEntry,
  GeneratedRiskRowEntry
} from './ai-generate'
import type { PpeItem, RamsDocument } from './types'

function norm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function matchLibrarySelections(
  document: RamsDocument,
  hazards: LibraryCatalogHazard[],
  ppeCatalog: LibraryCatalogPpe[]
): {
  activities: MatchedLibraryActivity[]
  hazards: MatchedLibraryHazard[]
  ppe: MatchedLibraryPpe[]
  customRiskRows: { activity: string; hazard: string }[]
  customPpe: PpeItem[]
  customActivities: string[]
  generatedRiskRows: GeneratedRiskRowEntry[]
  generatedPpeItems: GeneratedPpeEntry[]
} {
  const matchedHazards: MatchedLibraryHazard[] = []
  const seenHazardIds = new Set<number>()
  const customRiskRows: { activity: string; hazard: string }[] = []
  const generatedRiskRows: GeneratedRiskRowEntry[] = []

  document.riskAssessment.rows.forEach((row, index) => {
    const activity = norm(row.activity)
    const hazard = norm(row.hazard)
    if (!activity && !hazard) return

    const exact = hazards.find(
      (h) => norm(h.activity) === activity && norm(h.hazard) === hazard
    )
    const fuzzy =
      exact ??
      hazards.find(
        (h) =>
          norm(h.activity) === activity &&
          (norm(h.hazard).includes(hazard) || hazard.includes(norm(h.hazard)))
      )

    const category =
      fuzzy?.category ??
      hazards.find((h) => norm(h.activity) === activity)?.category ??
      (row.activity.trim() || 'General')

    if (fuzzy && !seenHazardIds.has(fuzzy.id)) {
      seenHazardIds.add(fuzzy.id)
      matchedHazards.push({
        id: fuzzy.id,
        category: fuzzy.category,
        activity: fuzzy.activity,
        hazard: fuzzy.hazard
      })
    } else if (!fuzzy) {
      customRiskRows.push({ activity: row.activity, hazard: row.hazard })
    }

    generatedRiskRows.push({
      id: `risk-${index}`,
      row,
      fromLibrary: Boolean(fuzzy),
      libraryHazardId: fuzzy?.id,
      category
    })
  })

  const matchedPpe: MatchedLibraryPpe[] = []
  const customPpe: PpeItem[] = []
  const generatedPpeItems: GeneratedPpeEntry[] = []

  document.ppeItems.forEach((item, index) => {
    const category = norm(item.category)
    const requirement = norm(item.requirement)
    if (!category && !requirement) return

    const found = ppeCatalog.find(
      (p) => norm(p.category) === category && norm(p.requirement) === requirement
    )

    if (found) {
      if (!matchedPpe.some((p) => norm(p.category) === category && norm(p.requirement) === requirement)) {
        matchedPpe.push({ category: found.category, requirement: found.requirement })
      }
    } else {
      customPpe.push(item)
    }

    generatedPpeItems.push({
      id: `ppe-${index}`,
      item,
      fromLibrary: Boolean(found)
    })
  })

  const categoryNames = new Set(hazards.map((h) => norm(h.category)))
  const hazardActivities = new Set(hazards.map((h) => norm(h.activity)))
  const matchedActivities: MatchedLibraryActivity[] = []
  const customActivities: string[] = []
  const seenActivityKeys = new Set<string>()

  for (const label of document.activities) {
    const n = norm(label)
    if (!n || n.includes('describe activities')) continue

    const category = hazards.find((h) => norm(h.category) === n)?.category
    const fromHazard = hazards.find((h) => norm(h.activity) === n)

    if (category || fromHazard || categoryNames.has(n) || hazardActivities.has(n)) {
      const key = fromHazard ? `h:${fromHazard.id}` : category ? `c:${norm(category)}` : `a:${n}`
      if (!seenActivityKeys.has(key)) {
        seenActivityKeys.add(key)
        matchedActivities.push({
          label,
          category: fromHazard?.category ?? category ?? label
        })
      }
    } else {
      customActivities.push(label)
    }
  }

  for (const h of matchedHazards) {
    const key = `h:${h.id}`
    if (!seenActivityKeys.has(key)) {
      seenActivityKeys.add(key)
      matchedActivities.push({ label: h.activity, category: h.category })
    }
  }

  return {
    activities: matchedActivities,
    hazards: matchedHazards,
    ppe: matchedPpe,
    customRiskRows,
    customPpe,
    customActivities,
    generatedRiskRows,
    generatedPpeItems
  }
}
