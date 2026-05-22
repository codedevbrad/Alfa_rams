import type { RamsDocument } from '@shared/rams/types'
import { createBlankSignOffRow } from '@shared/rams/document'
import { Field, TextInput, Section } from './Field'

interface SignOffTableProps {
  signOff: RamsDocument['signOff']
  onChange: (signOff: RamsDocument['signOff']) => void
}

export function SignOffTable({ signOff, onChange }: SignOffTableProps): React.JSX.Element {
  const setMeta = (key: keyof Omit<RamsDocument['signOff'], 'rows'>, value: string): void => {
    onChange({ ...signOff, [key]: value })
  }

  const updateRow = (
    index: number,
    key: keyof RamsDocument['signOff']['rows'][0],
    value: string
  ): void => {
    const rows = signOff.rows.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    onChange({ ...signOff, rows })
  }

  return (
    <Section title="RAMS sign-off sheet">
      <Field label="Description of work">
        <TextInput
          value={signOff.workDescription}
          onChange={(v) => setMeta('workDescription', v)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Job reference">
          <TextInput value={signOff.jobReference} onChange={(v) => setMeta('jobReference', v)} />
        </Field>
        <Field label="Client">
          <TextInput value={signOff.client} onChange={(v) => setMeta('client', v)} />
        </Field>
      </div>
      <Field label="Site address">
        <TextInput value={signOff.siteAddress} onChange={(v) => setMeta('siteAddress', v)} />
      </Field>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-600 text-slate-400">
              <th className="p-1">Name</th>
              <th className="p-1">Signature</th>
              <th className="p-1">Date</th>
              <th className="p-1">Company</th>
              <th className="p-1">Notes</th>
              <th className="w-12 p-1" />
            </tr>
          </thead>
          <tbody>
            {signOff.rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-700/50">
                {(['name', 'signature', 'date', 'company', 'notes'] as const).map((col) => (
                  <td key={col} className="p-1">
                    <input
                      value={row[col]}
                      onChange={(e) => updateRow(i, col, e.target.value)}
                      className="w-full min-w-[72px] rounded border border-slate-600 bg-slate-800 px-2 py-1 text-slate-100"
                    />
                  </td>
                ))}
                <td className="p-1">
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ ...signOff, rows: signOff.rows.filter((_, j) => j !== i) })
                    }
                    className="text-xs text-red-400"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() => onChange({ ...signOff, rows: [...signOff.rows, createBlankSignOffRow()] })}
        className="text-sm text-sky-400 hover:text-sky-300"
      >
        + Add signatory row
      </button>
    </Section>
  )
}
