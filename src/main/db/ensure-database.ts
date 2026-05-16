import { existsSync, readFileSync, readdirSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { app } from 'electron'
import { ACTIVITY_CATEGORIES } from '../../renderer/src/library/activities/activities'
import { PPE_CATEGORIES } from '../../renderer/src/library/ppe/ppe'
import { getDatabaseUrl, getPrisma } from './client'
import { seedLibraryData } from './seed-library'

function migrationsDirectory(): string {
  const devPath = join(app.getAppPath(), 'prisma', 'migrations')
  if (existsSync(devPath)) return devPath
  return join(process.resourcesPath, 'prisma', 'migrations')
}

async function schemaReady(): Promise<boolean> {
  try {
    await getPrisma().activityCategory.count()
    return true
  } catch {
    return false
  }
}

async function applyMigrations(): Promise<void> {
  const prisma = getPrisma()
  const migrationsDir = migrationsDirectory()
  if (!existsSync(migrationsDir)) return

  const migrationFolders = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  for (const folder of migrationFolders) {
    const sqlPath = join(migrationsDir, folder, 'migration.sql')
    if (!existsSync(sqlPath)) continue

    const sql = readFileSync(sqlPath, 'utf8')
    const statements = sql
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean)

    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement)
    }
  }
}

export async function ensureDatabase(): Promise<void> {
  const dbPath = getDatabaseUrl().replace(/^file:/, '')
  const dbDir = dirname(dbPath)
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }

  if (!(await schemaReady())) {
    await applyMigrations()
  }

  const prisma = getPrisma()
  const hazardCount = await prisma.activityHazard.count()

  if (hazardCount === 0) {
    await seedLibraryData(prisma, {
      activityCategories: ACTIVITY_CATEGORIES,
      ppeCategories: PPE_CATEGORIES
    })
  }
}
