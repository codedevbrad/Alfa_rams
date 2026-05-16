import type { RamsDocument } from '@shared/rams/types'
import { Field, TextArea, Section } from './Field'

interface HotWorkFormProps {
  hotWork: RamsDocument['hotWork']
  onChange: (hotWork: RamsDocument['hotWork']) => void
}

export function HotWorkForm({ hotWork, onChange }: HotWorkFormProps): React.JSX.Element {
  const set = (key: keyof RamsDocument['hotWork'], value: string): void => {
    onChange({ ...hotWork, [key]: value })
  }

  return (
    <Section title="Hot work assessment">
      <Field label="Prior to work commencement">
        <TextArea value={hotWork.priorToWork} rows={4} onChange={(v) => set('priorToWork', v)} />
      </Field>
      <Field label="Hazards">
        <TextArea value={hotWork.hazards} rows={3} onChange={(v) => set('hazards', v)} />
      </Field>
      <Field label="Harm">
        <TextArea value={hotWork.harm} rows={3} onChange={(v) => set('harm', v)} />
      </Field>
      <Field label="Control measures">
        <TextArea
          value={hotWork.controlMeasures}
          rows={4}
          onChange={(v) => set('controlMeasures', v)}
        />
      </Field>
      <Field label="On completion">
        <TextArea value={hotWork.onCompletion} rows={3} onChange={(v) => set('onCompletion', v)} />
      </Field>
    </Section>
  )
}
