import type { GmailLabelDto } from '@shared/email/gmail'
import { DEFAULT_GMAIL_MONITOR_LABEL } from '@shared/email/gmail'
import { getGmailLabel, setGmailLabel } from '../../settings/settings-store'
import { getGmailClient } from './oauth'

export async function listUserLabels(): Promise<GmailLabelDto[]> {
  const gmail = await getGmailClient()
  const res = await gmail.users.labels.list({ userId: 'me' })
  const labels = res.data.labels ?? []
  return labels
    .filter((l) => l.id && l.name && l.type === 'user')
    .map((l) => ({
      id: l.id!,
      name: l.name!,
      type: l.type ?? 'user'
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function resolveLabelByName(name: string): Promise<GmailLabelDto | null> {
  const labels = await listUserLabels()
  const exact = labels.find((l) => l.name === name)
  if (exact) return exact
  const lower = name.toLowerCase()
  return labels.find((l) => l.name.toLowerCase() === lower) ?? null
}

export async function setMonitoredLabel(labelId: string): Promise<GmailLabelDto> {
  const labels = await listUserLabels()
  const match = labels.find((l) => l.id === labelId)
  if (!match) {
    throw new Error('Label not found in your Gmail account')
  }
  await setGmailLabel(match.id, match.name)
  return match
}

export async function applyDefaultMonitorLabel(): Promise<GmailLabelDto | null> {
  const existing = await getGmailLabel()
  if (existing) {
    return { id: existing.id, name: existing.name, type: 'user' }
  }
  const resolved = await resolveLabelByName(DEFAULT_GMAIL_MONITOR_LABEL)
  if (!resolved) return null
  await setGmailLabel(resolved.id, resolved.name)
  return resolved
}

export async function getMonitoredLabel(): Promise<GmailLabelDto | null> {
  const stored = await getGmailLabel()
  if (!stored) return null
  return { id: stored.id, name: stored.name, type: 'user' }
}

export interface MonitoredLabelStats {
  messagesTotal: number
  messagesUnread: number
  threadsTotal: number
}

export async function getMonitoredLabelStats(): Promise<MonitoredLabelStats | null> {
  const label = await getMonitoredLabel()
  if (!label) return null
  const gmail = await getGmailClient()
  const res = await gmail.users.labels.get({ userId: 'me', id: label.id })
  return {
    messagesTotal: res.data.messagesTotal ?? 0,
    messagesUnread: res.data.messagesUnread ?? 0,
    threadsTotal: res.data.threadsTotal ?? 0
  }
}
