import type { RamsDocument } from '@shared/rams/types'
import { Field, TextArea, Section } from './Field'

const FIELDS: { key: keyof RamsDocument['methodStatement']; label: string; rows?: number }[] = [
  { key: 'scopeOfWork', label: '1. Scope of work', rows: 4 },
  { key: 'responsibilities', label: '2. Responsibilities', rows: 4 },
  { key: 'materialsAndEquipment', label: '3. Materials and equipment', rows: 4 },
  { key: 'healthAndSafety', label: '4. Health and safety', rows: 4 },
  { key: 'workProcedure', label: '5. Work procedure', rows: 5 },
  { key: 'environmentalConsiderations', label: '6. Environmental considerations', rows: 3 },
  { key: 'emergencyProcedures', label: '7. Emergency procedures', rows: 3 },
  { key: 'welfareRequirements', label: '8. Welfare requirements', rows: 2 },
  { key: 'liftingEquipment', label: '9. Lifting equipment and MHE', rows: 2 },
  { key: 'pat', label: '10. Portable appliance testing (PAT)', rows: 2 },
  { key: 'confinedSpaceNote', label: '11. Confined space note', rows: 2 },
  { key: 'highRiskControls', label: '12. High-risk controls', rows: 3 }
]

interface MethodStatementFormProps {
  methodStatement: RamsDocument['methodStatement']
  onChange: (methodStatement: RamsDocument['methodStatement']) => void
}

export function MethodStatementForm({
  methodStatement,
  onChange
}: MethodStatementFormProps): React.JSX.Element {
  return (
    <Section title="Method statement">
      {FIELDS.map(({ key, label, rows }) => (
        <Field key={key} label={label}>
          <TextArea
            value={methodStatement[key]}
            rows={rows ?? 3}
            onChange={(v) => onChange({ ...methodStatement, [key]: v })}
          />
        </Field>
      ))}
    </Section>
  )
}
