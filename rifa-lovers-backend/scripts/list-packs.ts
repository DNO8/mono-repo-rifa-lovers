import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config()

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL no está definida en .env')
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })

async function main() {
  const packs = await prisma.pack.findMany()
  console.log(JSON.stringify(packs, null, 2))
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
