import type { EmailSenderDto, UpsertEmailSenderInput } from '@shared/email/senders'
import type { EmailSenders } from '../../../generated/prisma/client'
import { getPrisma } from '../client'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function mapSender(row: EmailSenders): EmailSenderDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email
  }
}

function validateInput(name: string, email: string): void {
  if (!name) {
    throw new Error('Name is required')
  }
  if (!email) {
    throw new Error('Email is required')
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new Error('Enter a valid email address')
  }
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2002'
  )
}

export async function listEmailSenders(): Promise<EmailSenderDto[]> {
  const rows = await getPrisma().emailSenders.findMany({
    orderBy: { name: 'asc' }
  })
  return rows.map(mapSender)
}

export async function upsertEmailSender(input: UpsertEmailSenderInput): Promise<EmailSenderDto> {
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  validateInput(name, email)

  const prisma = getPrisma()
  try {
    const row = input.id
      ? await prisma.emailSenders.update({
          where: { id: input.id },
          data: { name, email }
        })
      : await prisma.emailSenders.create({
          data: { name, email }
        })
    return mapSender(row)
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error('A sender with this name or email already exists')
    }
    throw err
  }
}

export async function deleteEmailSender(id: number): Promise<void> {
  await getPrisma().emailSenders.delete({ where: { id } })
}

export async function getEmailSenderById(
  senderId: number
): Promise<{ name: string; email: string }> {
  const row = await getPrisma().emailSenders.findUnique({ where: { id: senderId } })
  if (!row) throw new Error('Sender not found')
  return { name: row.name, email: row.email }
}
