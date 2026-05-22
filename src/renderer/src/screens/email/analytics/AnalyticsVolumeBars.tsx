import type { EmailAnalyticsVolumeDay } from '@shared/email/analytics'

interface AnalyticsVolumeBarsProps {
  volumeByDay: EmailAnalyticsVolumeDay[]
}

export function AnalyticsVolumeBars({ volumeByDay }: AnalyticsVolumeBarsProps): React.JSX.Element {
  const max = Math.max(1, ...volumeByDay.map((d) => d.count))

  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
      <h2 className="text-sm font-semibold text-slate-200">Messages received (last 14 days)</h2>
      <p className="mt-1 text-xs text-slate-500">By Gmail message date in the scanned label set.</p>
      <ul className="mt-4 space-y-2">
        {volumeByDay.map((day) => {
          const pct = Math.round((day.count / max) * 100)
          const label = new Date(`${day.date}T12:00:00`).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          })
          return (
            <li key={day.date} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-slate-500">{label}</span>
              <div className="min-w-0 flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-sky-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="w-6 shrink-0 text-right text-xs text-slate-400">{day.count}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
