import type { EmailAnalyticsRecentFulfilled } from '@shared/email/analytics'

interface AnalyticsRecentFulfilledTableProps {
  recentFulfilled: EmailAnalyticsRecentFulfilled[]
}

export function AnalyticsRecentFulfilledTable({
  recentFulfilled
}: AnalyticsRecentFulfilledTableProps): React.JSX.Element {
  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
      <h2 className="text-sm font-semibold text-slate-200">Recently fulfilled</h2>
      {recentFulfilled.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No fulfilled messages tracked yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-700 text-slate-500">
                <th className="py-2 pr-3 font-medium">When</th>
                <th className="py-2 pr-3 font-medium">From</th>
                <th className="py-2 font-medium">Subject</th>
              </tr>
            </thead>
            <tbody>
              {recentFulfilled.map((row, i) => {
                const when = new Date(row.fulfilledAt).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })
                return (
                  <tr key={`${row.fulfilledAt}-${i}`} className="border-b border-slate-800/80">
                    <td className="whitespace-nowrap py-2 pr-3 text-slate-400">{when}</td>
                    <td className="max-w-[140px] truncate py-2 pr-3">{row.fromEmail}</td>
                    <td className="max-w-[200px] truncate py-2 text-slate-200">
                      {row.subject ?? '(no subject)'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
