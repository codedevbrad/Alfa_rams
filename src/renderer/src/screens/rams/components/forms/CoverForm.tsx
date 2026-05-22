import type { RamsDocument } from '@shared/rams/types'
import { Field, TextInput, Section } from './Field'

interface CoverFormProps {
  cover: RamsDocument['cover']
  onChange: (cover: RamsDocument['cover']) => void
}

export function CoverForm({ cover, onChange }: CoverFormProps): React.JSX.Element {
  const set = (key: keyof RamsDocument['cover'], value: string): void => {
    onChange({ ...cover, [key]: value })
  }

  return (
    <Section title="Cover">
      <Field label="Project title">
        <TextInput value={cover.projectTitle} onChange={(v) => set('projectTitle', v)} />
      </Field>
      <Field label="Location">
        <TextInput value={cover.location} onChange={(v) => set('location', v)} />
      </Field>
      <Field label="Client">
        <TextInput value={cover.client} onChange={(v) => set('client', v)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <TextInput value={cover.date} onChange={(v) => set('date', v)} />
        </Field>
        <Field label="Review date">
          <TextInput value={cover.reviewDate} onChange={(v) => set('reviewDate', v)} />
        </Field>
      </div>
    </Section>
  )
}
