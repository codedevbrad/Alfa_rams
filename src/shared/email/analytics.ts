export interface EmailAnalyticsLabel {
  id: string
  name: string
}

export interface EmailAnalyticsGmail {
  messagesTotal: number
  messagesUnread: number
  threadsTotal: number
  scannedCount: number
  scanCapped: boolean
}

export interface EmailAnalyticsLabelQueue {
  unopened: number
  opened: number
  fulfilled: number
}

export interface EmailAnalyticsTracking {
  total: number
  opened: number
  fulfilled: number
  replied: number
  fulfillmentRate: number | null
  avgHoursToFulfill: number | null
  avgHoursToReply: number | null
}

export interface EmailAnalyticsVolumeDay {
  date: string
  count: number
}

export interface EmailAnalyticsTopSender {
  fromEmail: string
  count: number
}

export interface EmailAnalyticsRecentFulfilled {
  fromEmail: string
  subject: string | null
  fulfilledAt: string
}

export interface EmailAnalyticsDto {
  label: EmailAnalyticsLabel | null
  gmail: EmailAnalyticsGmail
  labelQueue: EmailAnalyticsLabelQueue
  tracking: EmailAnalyticsTracking
  volumeByDay: EmailAnalyticsVolumeDay[]
  topSenders: EmailAnalyticsTopSender[]
  recentFulfilled: EmailAnalyticsRecentFulfilled[]
}

export const EMAIL_ANALYTICS_SCAN_CAP = 200
export const EMAIL_ANALYTICS_VOLUME_DAYS = 14
