/**
 * Script para crear milestones y premios para la rifa activa
 * 
 * Estructura: 5 milestones al 20%, 40%, 60%, 80%, 100% de goalPacks
 * Cada milestone tiene 1 premio asociado
 * 
 * Uso: npx tsx scripts/seed-milestones.ts
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

// Cargar variables de entorno desde .env
config()

// Verificar que DATABASE_URL existe
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL no está definida en .env')
  process.exit(1)
}

// Crear adapter con connection string
const adapter = new PrismaPg({ connectionString: databaseUrl })

// Crear PrismaClient con adapter
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed de milestones y premios...\n')

  // 1. Buscar la rifa activa
  const raffle = await prisma.raffle.findFirst({
    where: { status: 'active' },
  })

  if (!raffle) {
    console.error('❌ No hay rifa activa. Crea una rifa primero.')
    process.exit(1)
  }

  console.log(`✅ Rifa encontrada: ${raffle.title} (ID: ${raffle.id})`)
  console.log(`📊 Goal Packs: ${raffle.goalPacks}\n`)

  // 2. Definir los 5 milestones (20%, 40%, 60%, 80%, 100%)
  const milestoneDefinitions = [
    {
      percentage: 20,
      name: 'Primer Hito',
      prizeName: 'Gift Card $100.000',
      prizeDescription: 'Gift card para supermercado o retail',
      prizeEmoji: '🛒',
      sortOrder: 1,
    },
    {
      percentage: 40,
      name: 'Segundo Hito',
      prizeName: 'Respiro RifaLovers',
      prizeDescription: '$250.000 en vivo por transferencia',
      prizeEmoji: '💸',
      sortOrder: 2,
    },
    {
      percentage: 60,
      name: 'Tercer Hito',
      prizeName: 'Escapada RifaLovers',
      prizeDescription: 'Hotel + cena + experiencia para 2 personas',
      prizeEmoji: '🌊',
      sortOrder: 3,
    },
    {
      percentage: 80,
      name: 'Cuarto Hito',
      prizeName: 'Reimpulso RifaLovers',
      prizeDescription: '$250.000 adicionales en vivo',
      prizeEmoji: '💰',
      sortOrder: 4,
    },
    {
      percentage: 100,
      name: 'Meta Final',
      prizeName: 'Gran Desbloqueo',
      prizeDescription: 'MacBook Air M5 + Experiencia VIP',
      prizeEmoji: '🔓',
      sortOrder: 5,
    },
  ]

  // 3. Crear milestones y premios
  for (const def of milestoneDefinitions) {
    const requiredPacks = Math.round((raffle.goalPacks * def.percentage) / 100)

    console.log(`🎯 Creando Milestone ${def.percentage}% (${requiredPacks} packs)...`)

    // Buscar si el milestone ya existe
    const existingMilestone = await prisma.milestone.findFirst({
      where: {
        raffleId: raffle.id,
        sortOrder: def.sortOrder,
      },
    })

    let milestone
    if (existingMilestone) {
      // Actualizar milestone existente
      milestone = await prisma.milestone.update({
        where: { id: existingMilestone.id },
        data: {
          name: def.name,
          requiredPacks,
        },
      })
      console.log(`  📝 Milestone actualizado: ${milestone.name}`)
    } else {
      // Crear nuevo milestone
      milestone = await prisma.milestone.create({
        data: {
          raffleId: raffle.id,
          name: def.name,
          requiredPacks,
          sortOrder: def.sortOrder,
          isUnlocked: false,
        },
      })
      console.log(`  ✅ Milestone creado: ${milestone.name}`)
    }


    // Buscar si el premio ya existe para este milestone
    const existingPrize = await prisma.prize.findFirst({
      where: {
        milestoneId: milestone.id,
      },
    })

    let prize
    if (existingPrize) {
      // Actualizar premio existente
      prize = await prisma.prize.update({
        where: { id: existingPrize.id },
        data: {
          name: def.prizeName,
          description: def.prizeDescription,
        },
      })
      console.log(`  📝 Premio actualizado: ${prize.name}`)
    } else {
      // Crear nuevo premio
      prize = await prisma.prize.create({
        data: {
          raffleId: raffle.id,
          milestoneId: milestone.id,
          type: 'milestone',
          name: def.prizeName,
          description: def.prizeDescription,
          quantity: 1,
        },
      })
      console.log(`  ✅ Premio creado: ${prize.name}`)
    }

    console.log(`  🎁 ${def.prizeEmoji} ${prize.name}\n`)
  }

  console.log('✨ Seed completado exitosamente!')
  console.log(`\nResumen:`)
  console.log(`- Rifa: ${raffle.title}`)
  console.log(`- Goal Packs: ${raffle.goalPacks}`)
  console.log(`- Milestones creados: 5 (20%, 40%, 60%, 80%, 100%)`)
  console.log(`- Premios creados: 5`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
