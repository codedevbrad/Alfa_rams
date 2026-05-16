import type { RiskRow } from '@shared/rams/types'
import { createBlankRiskRow } from '@shared/rams/document'
import {
  LIKELIHOOD_SCALE,
  PERSONS_EXPOSED_LEGEND,
  RISK_BAND_LEGEND,
  SEVERITY_SCALE,
  type RiskScaleLevel
} from '@shared/rams/measures'
import { riskBand, withComputedRisks } from '@shared/rams/risk'
import { Section } from './Field'

function RiskScaleRow({ label, scale }: { label: string; scale: RiskScaleLevel[] }): React.JSX.Element {
  return (
    <tr className="border-b border-slate-700/50 text-slate-300">
      <td className="whitespace-nowrap p-1 font-medium text-slate-400">{label}</td>
      {scale.map(({ level, label: description }) => (
        <td key={level} className="p-1">
          <span className="font-medium text-slate-400">{level}</span> = {description}
        </td>
      ))}
    </tr>
  )
}

interface RiskMatrixTableProps {
  riskAssessment: {
    assessorName: string
    assessmentDate: string
    reassessmentDate: string
    rows: RiskRow[]
  }
  onChange: (riskAssessment: RiskMatrixTableProps['riskAssessment']) => void
}

export function RiskMatrixTable({
  riskAssessment,
  onChange
}: RiskMatrixTableProps): React.JSX.Element {
  const setMeta = (
    key: 'assessorName' | 'assessmentDate' | 'reassessmentDate',
    value: string
  ): void => {
    onChange({ ...riskAssessment, [key]: value })
  }

  const updateRow = (index: number, patch: Partial<RiskRow>): void => {
    const rows = riskAssessment.rows.map((row, i) => {
      if (i !== index) return row
      return withComputedRisks({ ...row, ...patch })
    })
    onChange({ ...riskAssessment, rows })
  }

  const addRow = (): void => {
    onChange({ ...riskAssessment, rows: [...riskAssessment.rows, createBlankRiskRow()] })
  }

  const removeRow = (index: number): void => {
    onChange({ ...riskAssessment, rows: riskAssessment.rows.filter((_, i) => i !== index) })
  }

  return (
    <Section title="Risk assessment matrix">
      <div className="overflow-x-auto">
        <table className="mb-2 w-full min-w-[900px] text-left text-xs">
          <tbody>
            <tr className="border-b border-slate-700/50 align-top">
              <td className="whitespace-nowrap p-1 font-medium text-slate-400">
                Assessor (PLEASE PRINT)
              </td>
              <td className="p-1">
                <input
                  value={riskAssessment.assessorName}
                  onChange={(e) => setMeta('assessorName', e.target.value)}
                  className="w-full min-w-[80px] rounded border border-slate-600 bg-slate-800 px-1 py-0.5"
                />
              </td>
              <td className="whitespace-nowrap p-1 font-medium text-slate-400">
                Date of assessment
              </td>
              <td className="p-1">
                <input
                  value={riskAssessment.assessmentDate}
                  onChange={(e) => setMeta('assessmentDate', e.target.value)}
                  className="w-full min-w-[72px] rounded border border-slate-600 bg-slate-800 px-1 py-0.5"
                />
              </td>
              <td className="whitespace-nowrap p-1 font-medium text-slate-400">
                Date of reassessment
              </td>
              <td className="p-1">
                <input
                  value={riskAssessment.reassessmentDate}
                  onChange={(e) => setMeta('reassessmentDate', e.target.value)}
                  className="w-full min-w-[72px] rounded border border-slate-600 bg-slate-800 px-1 py-0.5"
                />
              </td>
            </tr>
            <RiskScaleRow label="Likelihood ( L )" scale={LIKELIHOOD_SCALE} />
            <RiskScaleRow label="Severity ( S )" scale={SEVERITY_SCALE} />
          </tbody>
        </table>
        <table className="mb-2 w-full min-w-[900px] text-left text-xs">
          <tbody>
            <tr className="border-b border-slate-700/50 text-slate-300">
              <td className="whitespace-nowrap p-1 font-medium text-slate-400">Risk (R)</td>
              {RISK_BAND_LEGEND.map(({ range, band, action, color }) => (
                <td key={band} className="p-1">
                  {range}{' '}
                  <span style={{ color: `#${color}` }} className="font-semibold">
                    {band}
                  </span>
                  : {action}
                </td>
              ))}
            </tr>
            <tr className="border-b border-slate-700/50 text-slate-300">
              {PERSONS_EXPOSED_LEGEND.map((label) => (
                <td key={label} className="p-1">
                  {label}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-600 text-slate-400">
              <th className="p-1">Activity</th>
              <th className="p-1">Hazard</th>
              <th className="p-1 w-10">L</th>
              <th className="p-1 w-10">S</th>
              <th className="p-1 w-10">R</th>
              <th className="p-1 w-12">Who</th>
              <th className="p-1">Controls</th>
              <th className="p-1 w-10">L</th>
              <th className="p-1 w-10">S</th>
              <th className="p-1 w-10">R</th>
              <th className="p-1 w-12">Who</th>
              <th className="p-1">Monitoring</th>
              <th className="p-1 w-14" />
            </tr>
          </thead>
          <tbody>
            {riskAssessment.rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-700/50 align-top">
                <td className="p-1">
                  <input
                    value={row.activity}
                    onChange={(e) => updateRow(i, { activity: e.target.value })}
                    className="w-full min-w-[80px] rounded border border-slate-600 bg-slate-800 px-1 py-0.5"
                  />
                </td>
                <td className="p-1">
                  <input
                    value={row.hazard}
                    onChange={(e) => updateRow(i, { hazard: e.target.value })}
                    className="w-full min-w-[80px] rounded border border-slate-600 bg-slate-800 px-1 py-0.5"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={row.likelihood}
                    onChange={(e) => updateRow(i, { likelihood: Number(e.target.value) || 1 })}
                    className="w-10 rounded border border-slate-600 bg-slate-800 px-1 py-0.5"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={row.severity}
                    onChange={(e) => updateRow(i, { severity: Number(e.target.value) || 1 })}
                    className="w-10 rounded border border-slate-600 bg-slate-800 px-1 py-0.5"
                  />
                </td>
                <td className="p-1 text-slate-300" title={riskBand(row.risk)}>
                  {row.risk}
                </td>
                <td className="p-1">
                  <input
                    value={row.who}
                    onChange={(e) => updateRow(i, { who: e.target.value })}
                    className="w-12 rounded border border-slate-600 bg-slate-800 px-1 py-0.5"
                  />
                </td>
                <td className="p-1">
                  <textarea
                    value={row.controls}
                    rows={2}
                    onChange={(e) => updateRow(i, { controls: e.target.value })}
                    className="w-full min-w-[100px] rounded border border-slate-600 bg-slate-800 px-1 py-0.5"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={row.residualLikelihood}
                    onChange={(e) =>
                      updateRow(i, { residualLikelihood: Number(e.target.value) || 1 })
                    }
                    className="w-10 rounded border border-slate-600 bg-slate-800 px-1 py-0.5"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={row.residualSeverity}
                    onChange={(e) =>
                      updateRow(i, { residualSeverity: Number(e.target.value) || 1 })
                    }
                    className="w-10 rounded border border-slate-600 bg-slate-800 px-1 py-0.5"
                  />
                </td>
                <td className="p-1 text-slate-300" title={riskBand(row.residualRisk)}>
                  {row.residualRisk}
                </td>
                <td className="p-1">
                  <input
                    value={row.residualWho}
                    onChange={(e) => updateRow(i, { residualWho: e.target.value })}
                    className="w-12 rounded border border-slate-600 bg-slate-800 px-1 py-0.5"
                  />
                </td>
                <td className="p-1">
                  <textarea
                    value={row.monitoring}
                    rows={2}
                    onChange={(e) => updateRow(i, { monitoring: e.target.value })}
                    className="w-full min-w-[80px] rounded border border-slate-600 bg-slate-800 px-1 py-0.5"
                  />
                </td>
                <td className="p-1">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} className="text-sm text-sky-400 hover:text-sky-300">
        + Add risk row
      </button>
    </Section>
  )
}
