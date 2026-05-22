import type { InboundEmail } from '../../../generated/prisma/client'
import { getPrisma } from '../client'

export async function getInboundEmailByGmailIds(
  gmailMessageIds: string[]
): Promise<Map<string, InboundEmail>> {
  if (gmailMessageIds.length === 0) return new Map()
  const rows = await getPrisma().inboundEmail.findMany({
    where: { gmailMessageId: { in: gmailMessageIds } }
  })
  return new Map(rows.map((r) => [r.gmailMessageId, r]))
}

export async function upsertInboundEmail(data: {
  gmailMessageId: string
  threadId?: string | null
  fromEmail: string
  subject?: string | null
  openedAt?: Date | null
  repliedAt?: Date | null
  fulfilledAt?: Date | null
}): Promise<InboundEmail> {
  const prisma = getPrisma()
  const now = new Date()
  return prisma.inboundEmail.upsert({
    where: { gmailMessageId: data.gmailMessageId },
    create: {
      gmailMessageId: data.gmailMessageId,
      threadId: data.threadId ?? null,
      fromEmail: data.fromEmail,
      subject: data.subject ?? null,
      openedAt: data.openedAt ?? null,
      repliedAt: data.repliedAt ?? null,
      fulfilledAt: data.fulfilledAt ?? null
    },
    update: {
      threadId: data.threadId ?? undefined,
      fromEmail: data.fromEmail,
      subject: data.subject ?? undefined,
      openedAt: data.openedAt ?? undefined,
      repliedAt: data.repliedAt ?? undefined,
      fulfilledAt: data.fulfilledAt ?? undefined,
      updatedAt: now
    }
  })
}

export async function markInboundOpened(
  gmailMessageId: string,
  data: {
    fromEmail: string
    threadId?: string | null
    subject?: string | null
  }
): Promise<InboundEmail> {
  const prisma = getPrisma()
  const existing = await prisma.inboundEmail.findUnique({
    where: { gmailMessageId }
  })
  if (existing?.openedAt) return existing
  const now = new Date()
  return prisma.inboundEmail.upsert({
    where: { gmailMessageId },
    create: {
      gmailMessageId,
      threadId: data.threadId ?? null,
      fromEmail: data.fromEmail,
      subject: data.subject ?? null,
      openedAt: now
    },
    update: {
      threadId: data.threadId ?? undefined,
      fromEmail: data.fromEmail,
      subject: data.subject ?? undefined,
      openedAt: now,
      updatedAt: now
    }
  })
}

export interface InboundEmailAnalyticsDb {
  total: number
  opened: number
  fulfilled: number
  replied: number
  avgHoursToFulfill: number | null
  avgHoursToReply: number | null
  topSenders: { fromEmail: string; count: number }[]
  recentFulfilled: {
    fromEmail: string
    subject: string | null
    fulfilledAt: Date
  }[]
}

function meanHours(durationsMs: number[]): number | null {
  if (durationsMs.length === 0) return null
  const sum = durationsMs.reduce((a, b) => a + b, 0)
  return sum / durationsMs.length / (1000 * 60 * 60)
}

export async function getInboundEmailAnalytics(): Promise<InboundEmailAnalyticsDb> {
  const prisma = getPrisma()
  const [total, opened, fulfilled, replied, topSendersRaw, recentFulfilled, durationRows] =
    await Promise.all([
      prisma.inboundEmail.count(),
      prisma.inboundEmail.count({ where: { openedAt: { not: null } } }),
      prisma.inboundEmail.count({ where: { fulfilledAt: { not: null } } }),
      prisma.inboundEmail.count({ where: { repliedAt: { not: null } } }),
      prisma.inboundEmail.groupBy({
        by: ['fromEmail'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
      prisma.inboundEmail.findMany({
        where: { fulfilledAt: { not: null } },
        orderBy: { fulfilledAt: 'desc' },
        take: 10,
        select: { fromEmail: true, subject: true, fulfilledAt: true }
      }),
      prisma.inboundEmail.findMany({
        where: { openedAt: { not: null } },
        select: { openedAt: true, fulfilledAt: true, repliedAt: true }
      })
    ])

  const fulfillDurations: number[] = []
  const replyDurations: number[] = []
  for (const row of durationRows) {
    if (row.openedAt && row.fulfilledAt) {
      fulfillDurations.push(row.fulfilledAt.getTime() - row.openedAt.getTime())
    }
    if (row.openedAt && row.repliedAt) {
      replyDurations.push(row.repliedAt.getTime() - row.openedAt.getTime())
    }
  }

  return {
    total,
    opened,
    fulfilled,
    replied,
    avgHoursToFulfill: meanHours(fulfillDurations),
    avgHoursToReply: meanHours(replyDurations),
    topSenders: topSendersRaw.map((r) => ({
      fromEmail: r.fromEmail,
      count: r._count.id
    })),
    recentFulfilled: recentFulfilled
      .filter((r): r is typeof r & { fulfilledAt: Date } => r.fulfilledAt != null)
      .map((r) => ({
        fromEmail: r.fromEmail,
        subject: r.subject,
        fulfilledAt: r.fulfilledAt
      }))
  }
}

export async function markInboundFulfilled(
  gmailMessageId: string,
  data: {
    fromEmail: string
    threadId?: string | null
    subject?: string | null
    repliedAt?: boolean
  }
): Promise<InboundEmail> {
  const now = new Date()
  return upsertInboundEmail({
    gmailMessageId,
    threadId: data.threadId,
    fromEmail: data.fromEmail,
    subject: data.subject,
    fulfilledAt: now,
    repliedAt: data.repliedAt ? now : undefined
  })
}
