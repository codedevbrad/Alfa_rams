import type { RamsDocument } from '@shared/rams/types'
import { CoverForm } from './forms/CoverForm'
import { ActivitiesForm } from './forms/ActivitiesForm'
import { MethodStatementForm } from './forms/MethodStatementForm'
import { HotWorkForm } from './forms/HotWorkForm'
import { PpeTable } from './forms/PpeTable'
import { RescuePlanForm } from './forms/RescuePlanForm'
import { RiskMatrixTable } from './forms/RiskMatrixTable'
import { SignOffTable } from './forms/SignOffTable'

interface RamsEditorProps {
  document: RamsDocument
  onChange: (doc: RamsDocument) => void
}

export function RamsEditor({ document, onChange }: RamsEditorProps): React.JSX.Element {
  const patch = (partial: Partial<RamsDocument>): void => onChange({ ...document, ...partial })

  return (
    <div className="space-y-4 p-4">
      <CoverForm cover={document.cover} onChange={(cover) => patch({ cover })} />
      <ActivitiesForm
        activities={document.activities}
        onChange={(activities) => patch({ activities })}
      />
      <MethodStatementForm
        methodStatement={document.methodStatement}
        onChange={(methodStatement) => patch({ methodStatement })}
      />
      <HotWorkForm hotWork={document.hotWork} onChange={(hotWork) => patch({ hotWork })} />
      <PpeTable items={document.ppeItems} onChange={(ppeItems) => patch({ ppeItems })} />
      <RescuePlanForm
        rescuePlan={document.rescuePlan}
        onChange={(rescuePlan) => patch({ rescuePlan })}
      />
      <RiskMatrixTable
        riskAssessment={document.riskAssessment}
        onChange={(riskAssessment) => patch({ riskAssessment })}
      />
      <SignOffTable signOff={document.signOff} onChange={(signOff) => patch({ signOff })} />
    </div>
  )
}
