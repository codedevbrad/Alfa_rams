import type { PpeItem } from '@shared/rams/types'
import { PPE_ITEMS } from '../../ppe/ppe'
import { AddPpeRowButton } from '../../ppe/addPPERowPicker'
import { Section } from './Field'

interface PpeTableProps {
  items: PpeItem[]
  onChange: (items: PpeItem[]) => void
}

export function PpeTable({ items, onChange }: PpeTableProps): React.JSX.Element {
  const update = (index: number, patch: Partial<PpeItem>): void => {
    const next = items.map((row, i) => (i === index ? { ...row, ...patch } : row))
    onChange(next)
  }

  const addFromTemplate = (templateIndex: number): void => {
    const template = PPE_ITEMS[templateIndex]
    if (!template) return
    onChange([...items, structuredClone(template)])
  }

  const remove = (index: number): void => onChange(items.filter((_, i) => i !== index))

  return (
    <Section title="Required PPE">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-600 text-slate-400">
              <th className="py-2 pr-2">Category</th>
              <th className="py-2 pr-2">Requirement</th>
              <th className="w-16 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={i} className="border-b border-slate-700/50">
                <td className="py-1 pr-2">
                  <input
                    value={row.category}
                    onChange={(e) => update(i, { category: e.target.value })}
                    className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-slate-100"
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    value={row.requirement}
                    onChange={(e) => update(i, { requirement: e.target.value })}
                    className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-slate-100"
                  />
                </td>
                <td className="py-1">
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddPpeRowButton onAdd={addFromTemplate} />
    </Section>
  )
}
