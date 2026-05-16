import { useState } from 'react'
import type { ActivityHazardDto, PpeCategoryGroupDto, PpeItemDto } from '@shared/rams/library'
import { AddLibraryNameModal, LibraryConfirmModal } from './LibraryModal'
import { useRamsLibrary } from './useRamsLibrary'

type Tab = 'activities' | 'ppe'

type ConfirmAction =
  | { kind: 'delete-ppe-item'; item: PpeItemDto }
  | { kind: 'delete-ppe-group'; group: PpeCategoryGroupDto }
  | { kind: 'delete-activity-category'; id: number; label: string }
  | { kind: 'delete-activity-hazard'; id: number }

interface LibraryAdminProps {
  onBack: () => void
}

const inputClass =
  'w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100'

const newHazardInput = (categoryId: number) => ({
  categoryId,
  activity: 'New activity',
  hazard: 'New hazard',
  likelihood: 1,
  severity: 1,
  who: 'A/B',
  controls: '',
  residualLikelihood: 1,
  residualSeverity: 1,
  residualWho: 'A/B',
  monitoring: ''
})

export function LibraryAdmin({ onBack }: LibraryAdminProps): React.JSX.Element {
  const [tab, setTab] = useState<Tab>('activities')
  const [addPpeGroupOpen, setAddPpeGroupOpen] = useState(false)
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [confirming, setConfirming] = useState(false)
  const library = useRamsLibrary()

  const modalOpen = addPpeGroupOpen || addCategoryOpen || confirmAction !== null
  const confirmText = confirmAction ? confirmCopy(confirmAction) : null

  const handleConfirm = async (): Promise<void> => {
    if (!confirmAction) return
    setConfirming(true)
    try {
      switch (confirmAction.kind) {
        case 'delete-ppe-item':
          await library.deletePpeItem(confirmAction.item.id)
          break
        case 'delete-ppe-group':
          await library.deletePpeGroup(confirmAction.group.id)
          break
        case 'delete-activity-category':
          await library.deleteActivityCategory(confirmAction.id)
          break
        case 'delete-activity-hazard':
          await library.deleteActivityHazard(confirmAction.id)
          break
      }
      setConfirmAction(null)
    } finally {
      setConfirming(false)
    }
  }

  const initialLoading =
    library.loading &&
    library.ppeCategories.length === 0 &&
    library.activityCategories.length === 0

  return (
    <div className="flex max-h-full min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Manage library</h1>
          <p className="text-sm text-slate-400">
            Edit activity hazards and PPE used in RAMS documents
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          Back
        </button>
      </div>

      {library.error && (
        <p className="mb-3 shrink-0 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {library.error}
        </p>
      )}

      <div className="mb-4 flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setTab('activities')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            tab === 'activities' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Activities
        </button>
        <button
          type="button"
          onClick={() => setTab('ppe')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            tab === 'ppe' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          PPE
        </button>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        inert={modalOpen}
        aria-hidden={modalOpen}
      >
        {initialLoading ? (
          <p className="text-sm text-slate-500">Loading library…</p>
        ) : tab === 'activities' ? (
          <ActivitiesAdmin
            library={library}
            onAddCategory={() => setAddCategoryOpen(true)}
            onDeleteCategory={(id, label) =>
              setConfirmAction({ kind: 'delete-activity-category', id, label })
            }
            onDeleteHazard={(id) => setConfirmAction({ kind: 'delete-activity-hazard', id })}
          />
        ) : (
          <PpeAdmin
            library={library}
            onAddGroup={() => setAddPpeGroupOpen(true)}
            onDeleteGroup={(group) => setConfirmAction({ kind: 'delete-ppe-group', group })}
            onDeleteItem={(item) => setConfirmAction({ kind: 'delete-ppe-item', item })}
          />
        )}
      </div>

      <AddLibraryNameModal
        open={addPpeGroupOpen}
        title="Add PPE group"
        description="Groups organize PPE items in the library and Required PPE picker."
        label="Group name"
        placeholder="e.g. Head protection"
        submitLabel="Add group"
        onClose={() => setAddPpeGroupOpen(false)}
        onSubmit={(name) => library.upsertPpeGroup({ name })}
      />

      <AddLibraryNameModal
        open={addCategoryOpen}
        title="Add activity category"
        description="Categories group hazards in the library and risk row picker."
        label="Category name"
        placeholder="e.g. Working at height"
        submitLabel="Add category"
        onClose={() => setAddCategoryOpen(false)}
        onSubmit={(name) => library.upsertActivityCategory({ name })}
      />

      <LibraryConfirmModal
        open={confirmAction !== null}
        title={confirmText?.title ?? ''}
        message={confirmText?.message ?? ''}
        confirming={confirming}
        onClose={() => {
          if (!confirming) setConfirmAction(null)
        }}
        onConfirm={handleConfirm}
      />
    </div>
  )
}

function confirmCopy(action: ConfirmAction): { title: string; message: string } {
  switch (action.kind) {
    case 'delete-ppe-item':
      return {
        title: 'Delete PPE item',
        message: `Remove "${action.item.category}" from the library?`
      }
    case 'delete-ppe-group':
      return {
        title: 'Delete PPE group',
        message: `Delete "${action.group.group}" and all ${action.group.items.length} item(s)?`
      }
    case 'delete-activity-category':
      return {
        title: 'Delete category',
        message: `Delete "${action.label}" and all hazards in it?`
      }
    case 'delete-activity-hazard':
      return {
        title: 'Delete hazard',
        message: 'Remove this hazard from the library?'
      }
  }
}

function ActivitiesAdmin({
  library,
  onAddCategory,
  onDeleteCategory,
  onDeleteHazard
}: {
  library: ReturnType<typeof useRamsLibrary>
  onAddCategory: () => void
  onDeleteCategory: (id: number, label: string) => void
  onDeleteHazard: (id: number) => void
}): React.JSX.Element {
  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onAddCategory}
        className="text-sm text-sky-400 hover:text-sky-300"
      >
        + Add category
      </button>
      {library.activityCategories.map((category) => (
        <section
          key={category.id}
          className="rounded-lg border border-slate-700/80 bg-slate-900/50 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <input
              className={inputClass}
              defaultValue={category.category}
              onBlur={(e) =>
                void library.upsertActivityCategory({
                  id: category.id,
                  name: e.target.value
                })
              }
            />
            <button
              type="button"
              onClick={() => onDeleteCategory(category.id, category.category)}
              className="shrink-0 text-xs text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
          <div className="space-y-3">
            {category.hazards.map((hazard) => (
              <HazardEditor
                key={hazard.id}
                hazard={hazard}
                onSave={(patch) =>
                  void library.upsertActivityHazard({ ...hazard, ...patch })
                }
                onDelete={() => onDeleteHazard(hazard.id)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => void library.upsertActivityHazard(newHazardInput(category.id))}
            className="mt-3 text-xs text-sky-400 hover:text-sky-300"
          >
            + Add hazard
          </button>
        </section>
      ))}
    </div>
  )
}

function HazardEditor({
  hazard,
  onSave,
  onDelete
}: {
  hazard: ActivityHazardDto
  onSave: (patch: Partial<ActivityHazardDto>) => void
  onDelete: () => void
}): React.JSX.Element {
  return (
    <div className="rounded border border-slate-700/60 p-3 text-xs">
      <div className="mb-2 grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-0.5 block text-slate-500">Activity</span>
          <input
            className={inputClass}
            value={hazard.activity}
            onBlur={(e) => onSave({ activity: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-slate-500">Hazard</span>
          <input
            className={inputClass}
            value={hazard.hazard}
            onBlur={(e) => onSave({ hazard: e.target.value })}
          />
        </label>
      </div>
      <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {(
          [
            ['L', 'likelihood'],
            ['S', 'severity'],
            ['Who', 'who'],
            ['Res. L', 'residualLikelihood'],
            ['Res. S', 'residualSeverity'],
            ['Res. Who', 'residualWho']
          ] as const
        ).map(([label, key]) => (
          <label key={key} className="block">
            <span className="mb-0.5 block text-slate-500">{label}</span>
            <input
              className={inputClass}
              type={key.includes('likelihood') || key.includes('severity') ? 'number' : 'text'}
              min={1}
              max={5}
              value={hazard[key]}
              onBlur={(e) =>
                onSave({
                  [key]:
                    key.includes('likelihood') || key.includes('severity')
                      ? Number(e.target.value) || 1
                      : e.target.value
                } as Partial<ActivityHazardDto>)
              }
            />
          </label>
        ))}
      </div>
      <label className="mb-2 block">
        <span className="mb-0.5 block text-slate-500">Controls</span>
        <textarea
          className={inputClass}
          rows={2}
          value={hazard.controls}
          onBlur={(e) => onSave({ controls: e.target.value })}
        />
      </label>
      <label className="mb-2 block">
        <span className="mb-0.5 block text-slate-500">Monitoring</span>
        <textarea
          className={inputClass}
          rows={2}
          value={hazard.monitoring}
          onBlur={(e) => onSave({ monitoring: e.target.value })}
        />
      </label>
      <button type="button" onClick={onDelete} className="text-red-400 hover:text-red-300">
        Delete hazard
      </button>
    </div>
  )
}

function PpeAdmin({
  library,
  onAddGroup,
  onDeleteGroup,
  onDeleteItem
}: {
  library: ReturnType<typeof useRamsLibrary>
  onAddGroup: () => void
  onDeleteGroup: (group: PpeCategoryGroupDto) => void
  onDeleteItem: (item: PpeItemDto) => void
}): React.JSX.Element {
  return (
    <div className="space-y-6">
      <button type="button" onClick={onAddGroup} className="text-sm text-sky-400 hover:text-sky-300">
        + Add group
      </button>
      {library.ppeCategories.map((group) => (
        <section
          key={group.id}
          className="rounded-lg border border-slate-700/80 bg-slate-900/50 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <input
              className={inputClass}
              defaultValue={group.group}
              onBlur={(e) =>
                void library.upsertPpeGroup({ id: group.id, name: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => onDeleteGroup(group)}
              className="shrink-0 text-xs text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
          <div className="space-y-2">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 rounded border border-slate-700/60 p-2 sm:grid-cols-[1fr_2fr_auto]"
              >
                <input
                  className={inputClass}
                  defaultValue={item.category}
                  onBlur={(e) =>
                    void library.upsertPpeItem({
                      id: item.id,
                      groupId: item.groupId,
                      category: e.target.value,
                      requirement: item.requirement
                    })
                  }
                  placeholder="Category"
                />
                <input
                  className={inputClass}
                  defaultValue={item.requirement}
                  onBlur={(e) =>
                    void library.upsertPpeItem({
                      id: item.id,
                      groupId: item.groupId,
                      category: item.category,
                      requirement: e.target.value
                    })
                  }
                  placeholder="Requirement"
                />
                <button
                  type="button"
                  onClick={() => onDeleteItem(item)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              void library.upsertPpeItem({
                groupId: group.id,
                category: 'NEW CATEGORY',
                requirement: 'Requirement'
              })
            }
            className="mt-3 text-xs text-sky-400 hover:text-sky-300"
          >
            + Add item
          </button>
        </section>
      ))}
    </div>
  )
}
