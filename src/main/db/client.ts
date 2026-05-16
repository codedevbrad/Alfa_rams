import { join } from 'path'
import { app } from 'electron'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../../generated/prisma/client'

let prisma: PrismaClient | null = null

export function getDatabaseUrl(): string {
  return `file:${join(app.getPath('userData'), 'rams-library.db')}`
}

export function getPrisma(): PrismaClient {
  if (!prisma) {
    const adapter = new PrismaBetterSqlite3({ url: getDatabaseUrl() })
    prisma = new PrismaClient({ adapter })
  }
  return prisma
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}
