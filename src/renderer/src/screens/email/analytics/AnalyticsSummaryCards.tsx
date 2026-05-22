import type { EmailAnalyticsDto } from '@shared/email/analytics'

function StatCard({
  label,
  value,
  detail
}: {
  label: string
  value: string
  detail?: string
}): React.JSX.Element {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
      {detail && <p className="text-xs text-slate-400">{detail}</p>}
    </div>
  )
}

function formatHours(hours: number | null): string {
  if (hours == null) return '—'
  if (hours < 1) return `${Math.round(hours * 60)} min`
  return `${hours.toFixed(1)} h`
}

function formatRate(rate: number | null): string {
  if (rate == null) return '—'
  return `${Math.round(rate * 100)}%`
}

interface AnalyticsSummaryCardsProps {
  data: EmailAnalyticsDto
}

export function AnalyticsSummaryCards({ data }: AnalyticsSummaryCardsProps): React.JSX.Element {
  const { gmail, labelQueue, tracking } = data
  const queueTotal = labelQueue.unopened + labelQueue.opened + labelQueue.fulfilled

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Gmail label messages"
        value={String(gmail.messagesTotal)}
        detail={
          gmail.messagesUnread > 0
            ? `${gmail.messagesUnread} unread · ${gmail.threadsTotal} threads`
            : `${gmail.threadsTotal} threads`
        }
      />
      <StatCard
        label="Label queue (scanned)"
        value={String(queueTotal)}
        detail={
          gmail.scanCapped
            ? `Based on ${gmail.scannedCount} most recent`
            : `${labelQueue.unopened} unopened · ${labelQueue.opened} opened · ${labelQueue.fulfilled} fulfilled`
        }
      />
      <StatCard
        label="App tracking (all time)"
        value={String(tracking.total)}
        detail={`${tracking.opened} opened · ${tracking.fulfilled} fulfilled · ${tracking.replied} replied`}
      />
      <StatCard
        label="Fulfillment rate"
        value={formatRate(tracking.fulfillmentRate)}
        detail={`Avg open→fulfill ${formatHours(tracking.avgHoursToFulfill)} · open→reply ${formatHours(tracking.avgHoursToReply)}`}
      />
    </div>
  )
}
