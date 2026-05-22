import type { EmailAnalyticsTopSender } from '@shared/email/analytics'

interface AnalyticsTopSendersTableProps {
  topSenders: EmailAnalyticsTopSender[]
}

export function AnalyticsTopSendersTable({
  topSenders
}: AnalyticsTopSendersTableProps): React.JSX.Element {
  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-4">
      <h2 className="text-sm font-semibold text-slate-200">Top senders (app tracking)</h2>
      <p className="mt-1 text-xs text-slate-500">All-time counts from opened or fulfilled messages.</p>
      {topSenders.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No tracked senders yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-700 text-slate-500">
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 font-medium">Messages</th>
              </tr>
            </thead>
            <tbody>
              {topSenders.map((row) => (
                <tr key={row.fromEmail} className="border-b border-slate-800/80">
                  <td className="max-w-[240px] truncate py-2 pr-3 text-slate-200">{row.fromEmail}</td>
                  <td className="py-2">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
