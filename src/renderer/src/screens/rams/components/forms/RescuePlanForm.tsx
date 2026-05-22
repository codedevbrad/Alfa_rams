import type { RamsDocument } from '@shared/rams/types'
import { Field, TextInput, TextArea, Section } from './Field'

interface RescuePlanFormProps {
  rescuePlan: RamsDocument['rescuePlan']
  onChange: (rescuePlan: RamsDocument['rescuePlan']) => void
}

export function RescuePlanForm({ rescuePlan, onChange }: RescuePlanFormProps): React.JSX.Element {
  return (
    <Section title="Rescue plan">
      <Field label="Title">
        <TextInput
          value={rescuePlan.title}
          onChange={(v) => onChange({ ...rescuePlan, title: v })}
        />
      </Field>
      <Field label="Procedure">
        <TextArea
          value={rescuePlan.body}
          rows={5}
          onChange={(v) => onChange({ ...rescuePlan, body: v })}
        />
      </Field>
    </Section>
  )
}
