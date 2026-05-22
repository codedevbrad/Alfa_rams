import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
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
import type { RiskRow } from '@shared/rams/types'

interface RamsLibraryContextValue {
  activityCategories: ActivityCategoryDto[]
  ppeCategories: PpeCategoryGroupDto[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  upsertActivityCategory: (input: UpsertActivityCategoryInput) => Promise<void>
  deleteActivityCategory: (id: number) => Promise<void>
  upsertActivityHazard: (input: UpsertActivityHazardInput) => Promise<void>
  deleteActivityHazard: (id: number) => Promise<void>
  upsertPpeGroup: (input: UpsertPpeGroupInput) => Promise<void>
  deletePpeGroup: (id: number) => Promise<void>
  upsertPpeItem: (input: UpsertPpeItemInput) => Promise<void>
  deletePpeItem: (id: number) => Promise<void>
}

const RamsLibraryContext = createContext<RamsLibraryContextValue | null>(null)

export function RamsLibraryProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [activityCategories, setActivityCategories] = useState<ActivityCategoryDto[]>([])
  const [ppeCategories, setPpeCategories] = useState<PpeCategoryGroupDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const [activities, ppe] = await Promise.all([
        window.api.rams.listActivityCategories(),
        window.api.rams.listPpeCategories()
      ])
      setActivityCategories(activities)
      setPpeCategories(ppe)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load library')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const upsertActivityCategory = useCallback(
    async (input: UpsertActivityCategoryInput): Promise<void> => {
      const row = await window.api.rams.upsertActivityCategory(input)
      setActivityCategories((prev) => {
        const index = prev.findIndex((c) => c.id === row.id)
        if (index === -1) {
          return [...prev, { ...row, hazards: [] }]
        }
        return prev.map((c) =>
          c.id === row.id ? { ...c, category: row.category, sortOrder: row.sortOrder } : c
        )
      })
    },
    []
  )

  const deleteActivityCategory = useCallback(async (id: number): Promise<void> => {
    await window.api.rams.deleteActivityCategory(id)
    setActivityCategories((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const upsertActivityHazard = useCallback(
    async (input: UpsertActivityHazardInput): Promise<void> => {
      const row = await window.api.rams.upsertActivityHazard(input)
      setActivityCategories((prev) =>
        prev.map((c) => {
          if (c.id !== row.categoryId) return c
          const hazards = c.hazards.some((h) => h.id === row.id)
            ? c.hazards.map((h) => (h.id === row.id ? row : h))
            : [...c.hazards, row]
          return { ...c, hazards }
        })
      )
    },
    []
  )

  const deleteActivityHazard = useCallback(async (id: number): Promise<void> => {
    await window.api.rams.deleteActivityHazard(id)
    setActivityCategories((prev) =>
      prev.map((c) => ({
        ...c,
        hazards: c.hazards.filter((h) => h.id !== id)
      }))
    )
  }, [])

  const upsertPpeGroup = useCallback(async (input: UpsertPpeGroupInput): Promise<void> => {
    const row = await window.api.rams.upsertPpeGroup(input)
    setPpeCategories((prev) => {
      const index = prev.findIndex((g) => g.id === row.id)
      if (index === -1) {
        return [...prev, row]
      }
      return prev.map((g) =>
        g.id === row.id ? { ...g, group: row.group, sortOrder: row.sortOrder } : g
      )
    })
  }, [])

  const deletePpeGroup = useCallback(async (id: number): Promise<void> => {
    await window.api.rams.deletePpeGroup(id)
    setPpeCategories((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const upsertPpeItem = useCallback(async (input: UpsertPpeItemInput): Promise<void> => {
    const row = await window.api.rams.upsertPpeItem(input)
    setPpeCategories((prev) =>
      prev.map((g) => {
        if (g.id !== row.groupId) return g
        const items = g.items.some((i) => i.id === row.id)
          ? g.items.map((i) => (i.id === row.id ? row : i))
          : [...g.items, row]
        return { ...g, items }
      })
    )
  }, [])

  const deletePpeItem = useCallback(async (id: number): Promise<void> => {
    await window.api.rams.deletePpeItem(id)
    setPpeCategories((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.filter((i) => i.id !== id)
      }))
    )
  }, [])

  const value = useMemo<RamsLibraryContextValue>(
    () => ({
      activityCategories,
      ppeCategories,
      loading,
      error,
      refresh,
      upsertActivityCategory,
      deleteActivityCategory,
      upsertActivityHazard,
      deleteActivityHazard,
      upsertPpeGroup,
      deletePpeGroup,
      upsertPpeItem,
      deletePpeItem
    }),
    [
      activityCategories,
      ppeCategories,
      loading,
      error,
      refresh,
      upsertActivityCategory,
      deleteActivityCategory,
      upsertActivityHazard,
      deleteActivityHazard,
      upsertPpeGroup,
      deletePpeGroup,
      upsertPpeItem,
      deletePpeItem
    ]
  )

  return <RamsLibraryContext.Provider value={value}>{children}</RamsLibraryContext.Provider>
}

export function useRamsLibrary(): RamsLibraryContextValue {
  const ctx = useContext(RamsLibraryContext)
  if (!ctx) {
    throw new Error('useRamsLibrary must be used within RamsLibraryProvider')
  }
  return ctx
}

export function hazardToRiskRow(hazard: ActivityHazardDto): RiskRow {
  const { id: _id, categoryId: _categoryId, sortOrder: _sortOrder, ...row } = hazard
  return row
}

export function ppeItemToRow(item: PpeItemDto): { category: string; requirement: string } {
  const { id: _id, groupId: _groupId, sortOrder: _sortOrder, category, requirement } = item
  return { category, requirement }
}
