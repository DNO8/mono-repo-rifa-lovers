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
  console.log('👥 Usuarios disponibles en la base de datos:\n')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  if (users.length === 0) {
    console.log('❌ No hay usuarios en la base de datos.')
    console.log('   Crea un usuario primero usando POST /auth/register')
  } else {
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.firstName || ''} ${u.lastName || ''}`)
      console.log(`   Email: ${u.email}`)
      console.log(`   Role: ${u.role}`)
      console.log(`   ID: ${u.id}`)
      console.log('')
    })
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
