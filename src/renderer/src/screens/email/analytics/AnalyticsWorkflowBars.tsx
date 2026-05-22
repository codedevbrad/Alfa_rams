import type { EmailAnalyticsLabelQueue } from '@shared/email/analytics'

interface AnalyticsWorkflowBarsProps {
  labelQueue: EmailAnalyticsLabelQueue
  scanCapped: boolean
  scannedCount: number
}

export function AnalyticsWorkflowBars({
  labelQueue,
  scanCapped,
  scannedCount
}: AnalyticsWorkflowBarsProps): React.JSX.Element {
  const total = labelQueue.unopened + labelQueue.opened + labelQueue.fulfilled
  const rows = [
    { key: 'unopened', label: 'Unopened', count: labelQueue.unopened, color: 'bg-slate-500' },
    { key: 'opened', label: 'Opened', count: labelQueue.opened, color: 'bg-amber-500' },
    { key: 'fulfilled', label: 'Fulfilled', count: labelQueue.fulfilled, color: 'bg-emerald-500' }
  ] as const

  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
      <h2 className="text-sm font-semibold text-slate-200">Label queue workflow</h2>
      {scanCapped && (
        <p className="mt-1 text-xs text-slate-500">
          Workflow breakdown based on the most recent {scannedCount} messages in the label.
        </p>
      )}
      {total === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No messages in the scanned set.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => {
            const pct = total > 0 ? Math.round((row.count / total) * 100) : 0
            return (
              <li key={row.key}>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>{row.label}</span>
                  <span>
                    {row.count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${row.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
