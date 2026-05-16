import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import { ACTIVITY_CATEGORIES } from '../src/renderer/src/library/activities/activities'
import { PPE_CATEGORIES } from '../src/renderer/src/library/ppe/ppe'
import { seedLibraryData } from '../src/main/db/seed-library'

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
  const adapter = new PrismaBetterSqlite3({ url })
  const prisma = new PrismaClient({ adapter })

  await seedLibraryData(prisma, {
    activityCategories: ACTIVITY_CATEGORIES,
    ppeCategories: PPE_CATEGORIES
  })

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
