import { Field, TextArea, Section } from './Field'

interface ActivitiesFormProps {
  activities: string[]
  onChange: (activities: string[]) => void
}

export function ActivitiesForm({ activities, onChange }: ActivitiesFormProps): React.JSX.Element {
  const text = activities.join('\n')

  return (
    <Section title="Activities & persons involved">
      <Field label="One activity per line">
        <TextArea
          value={text}
          rows={5}
          onChange={(v) =>
            onChange(
              v
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
        />
      </Field>
    </Section>
  )
}
