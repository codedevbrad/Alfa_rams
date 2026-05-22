import type { EmailAnalyticsDto } from '@shared/email/analytics'
import {
  EMAIL_ANALYTICS_SCAN_CAP,
  EMAIL_ANALYTICS_VOLUME_DAYS
} from '@shared/email/analytics'
import { workflowStatusFromRecord } from '@shared/email/inbox'
import { getInboundEmailByGmailIds, getInboundEmailAnalytics } from '../../db/email/inbound-email-service'
import { getMonitoredLabel, getMonitoredLabelStats } from '../gmail/labels'
import { listMessageSummariesByLabel } from '../gmail/messages'

function emptyAnalytics(): EmailAnalyticsDto {
  return {
    label: null,
    gmail: {
      messagesTotal: 0,
      messagesUnread: 0,
      threadsTotal: 0,
      scannedCount: 0,
      scanCapped: false
    },
    labelQueue: { unopened: 0, opened: 0, fulfilled: 0 },
    tracking: {
      total: 0,
      opened: 0,
      fulfilled: 0,
      replied: 0,
      fulfillmentRate: null,
      avgHoursToFulfill: null,
      avgHoursToReply: null
    },
    volumeByDay: buildVolumeByDay([]),
    topSenders: [],
    recentFulfilled: []
  }
}

function dayKeyFromMs(ms: number): string {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function lastNDayKeys(n: number): string[] {
  const keys: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    keys.push(dayKeyFromMs(d.getTime()))
  }
  return keys
}

function buildVolumeByDay(internalDates: number[]): EmailAnalyticsDto['volumeByDay'] {
  const keys = lastNDayKeys(EMAIL_ANALYTICS_VOLUME_DAYS)
  const counts = new Map(keys.map((k) => [k, 0]))
  for (const ms of internalDates) {
    const key = dayKeyFromMs(ms)
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return keys.map((date) => ({ date, count: counts.get(date) ?? 0 }))
}

export async function getEmailAnalytics(): Promise<EmailAnalyticsDto> {
  const label = await getMonitoredLabel()
  if (!label) {
    const db = await getInboundEmailAnalytics()
    const fulfillmentRate =
      db.opened > 0 ? Math.round((db.fulfilled / db.opened) * 1000) / 1000 : null
    return {
      ...emptyAnalytics(),
      tracking: {
        total: db.total,
        opened: db.opened,
        fulfilled: db.fulfilled,
        replied: db.replied,
        fulfillmentRate,
        avgHoursToFulfill: db.avgHoursToFulfill,
        avgHoursToReply: db.avgHoursToReply
      },
      topSenders: db.topSenders,
      recentFulfilled: db.recentFulfilled.map((r) => ({
        fromEmail: r.fromEmail,
        subject: r.subject,
        fulfilledAt: r.fulfilledAt.toISOString()
      }))
    }
  }

  const [labelStats, summaries, db] = await Promise.all([
    getMonitoredLabelStats(),
    listMessageSummariesByLabel({ maxMessages: EMAIL_ANALYTICS_SCAN_CAP }),
    getInboundEmailAnalytics()
  ])

  const messagesTotal = labelStats?.messagesTotal ?? summaries.length
  const scanCapped = messagesTotal > summaries.length

  const inboundById = await getInboundEmailByGmailIds(summaries.map((m) => m.gmailMessageId))
  const labelQueue = { unopened: 0, opened: 0, fulfilled: 0 }
  for (const m of summaries) {
    const status = workflowStatusFromRecord(inboundById.get(m.gmailMessageId))
    if (status === 'fulfilled') labelQueue.fulfilled++
    else if (status === 'opened') labelQueue.opened++
    else labelQueue.unopened++
  }

  const fulfillmentRate =
    db.opened > 0 ? Math.round((db.fulfilled / db.opened) * 1000) / 1000 : null

  return {
    label: { id: label.id, name: label.name },
    gmail: {
      messagesTotal,
      messagesUnread: labelStats?.messagesUnread ?? 0,
      threadsTotal: labelStats?.threadsTotal ?? 0,
      scannedCount: summaries.length,
      scanCapped
    },
    labelQueue,
    tracking: {
      total: db.total,
      opened: db.opened,
      fulfilled: db.fulfilled,
      replied: db.replied,
      fulfillmentRate,
      avgHoursToFulfill: db.avgHoursToFulfill,
      avgHoursToReply: db.avgHoursToReply
    },
    volumeByDay: buildVolumeByDay(summaries.map((m) => m.internalDate)),
    topSenders: db.topSenders,
    recentFulfilled: db.recentFulfilled.map((r) => ({
      fromEmail: r.fromEmail,
      subject: r.subject,
      fulfilledAt: r.fulfilledAt.toISOString()
    }))
  }
}
