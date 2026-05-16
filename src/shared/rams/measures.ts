export interface RiskScaleLevel {
  level: number
  label: string
}

export const LIKELIHOOD_SCALE: RiskScaleLevel[] = [
  { level: 1, label: 'Very unlikely' },
  { level: 2, label: 'Unlikely' },
  { level: 3, label: 'Likely' },
  { level: 4, label: 'Major injury illness' },
  { level: 5, label: 'Almost certain' }
]

export const SEVERITY_SCALE: RiskScaleLevel[] = [
  { level: 1, label: 'First aid required' },
  { level: 2, label: 'Minor injury or illness' },
  { level: 3, label: 'Riddor' },
  { level: 4, label: 'Major injury illness' },
  { level: 5, label: 'Fatal or disabling' }
]

export interface RiskBandLegend {
  range: string
  band: string
  action: string
  /** Word OOXML colour (RRGGBB, no #) */
  color: string
}

export const RISK_BAND_LEGEND: RiskBandLegend[] = [
  { range: '1-5', band: 'Low', action: 'no further action', color: '00B050' },
  {
    range: '6-12',
    band: 'Medium',
    action: 'introduce further controls or monitoring to reduce risk',
    color: 'FFC000'
  },
  {
    range: '13-25',
    band: 'High',
    action:
      'stop process until further controls or monitoring can reduce risk or seek advice',
    color: 'FF0000'
  }
]

export const PERSONS_EXPOSED_LEGEND = [
  "Person's exposed (who)",
  'Operative = A',
  'Other Employees = B',
  'Others / Public = C'
] as const
