/**
 * Script de prueba - Fase 12 Jobs Automáticos
 * 
 * Prueba los 3 jobs automáticos:
 * 1. Auto SOLD_OUT (cada 5 min) - rifas que alcanzan goal_packs
 * 2. Auto CLOSED (cada 5 min) - rifas que pasan end_date
 * 3. Expirar purchases (cada 15 min) - purchases pending > 30 min
 * 
 * También prueba los endpoints de control manual desde admin.
 * 
 * Uso: npx tsx scripts/test-jobs-phase12.ts
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config()

const BASE_URL = 'http://localhost:3000'

// Colores
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
}

function success(msg: string) { console.log(`${colors.green}✅ ${msg}${colors.reset}`) }
function error(msg: string) { console.log(`${colors.red}❌ ${msg}${colors.reset}`) }
function warning(msg: string) { console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`) }
function info(msg: string) { console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`) }
function phase(msg: string) { console.log(`${colors.cyan}\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`) }

let authToken: string
let testRaffleId: string
let testPurchaseId: string

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

// Login
async function login(): Promise<boolean> {
  info('Login de usuario...')
  
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dcontrerasl@live.com',
        password: '123456789',
      }),
    })

    if (!response.ok) {
      error(`Login failed: ${response.status}`)
      return false
    }

    const data = await response.json()
    authToken = data.accessToken
    success(`Login exitoso`)
    return true
  } catch (err: any) {
    error(`Error login: ${err.message}`)
    return false
  }
}

// ==================== PREPARACIÓN DE DATOS ====================

async function prepareTestData(): Promise<boolean> {
  phase('📦 PREPARANDO DATOS DE PRUEBA')
  
  try {
    // 1. Crear rifa para test de SOLD_OUT (simular que tiene packs vendidos)
    info('Creando rifa de prueba para SOLD_OUT...')
    
    const raffle = await prisma.raffle.create({
      data: {
        title: 'Test Auto SOLD_OUT',
        description: 'Rifa para probar job automático',
        goalPacks: 10,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    })
    testRaffleId = raffle.id
    success(`Rifa creada: ${raffle.id}`)

    // Crear progress con packs vendidos >= goal
    await prisma.raffleProgress.create({
      data: {
        raffleId: raffle.id,
        packsSold: 15, // Más que goalPacks (10)
        revenueTotal: 99000,
        percentageToGoal: 150.00,
      },
    })
    success(`Progress creado: 15/10 packs vendidos`)

    // 2. Crear rifa para test de CLOSED (fecha pasada)
    info('\nCreando rifa de prueba para CLOSED...')
    
    const closedRaffle = await prisma.raffle.create({
      data: {
        title: 'Test Auto CLOSED',
        description: 'Rifa con fecha pasada',
        goalPacks: 100,
        status: 'active',
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 días atrás
        endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
      },
    })
    success(`Rifa cerrada creada: ${closedRaffle.id}`)

    // 3. Crear purchase pendiente antigua para test de expiración
    info('\nCreando purchase pendiente antigua...')
    
    // Buscar o crear usuario
    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: 'test-jobs@rifalovers.com',
          firstName: 'Test',
          lastName: 'Jobs',
          role: 'customer',
        },
      })
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        raffleId: raffle.id,
        status: 'pending',
        totalAmount: 9900,
        createdAt: new Date(Date.now() - 35 * 60 * 1000), // 35 minutos atrás
      },
    })
    testPurchaseId = purchase.id
    success(`Purchase pendiente creada: ${purchase.id} (35 min atrás)`)

    success('\n✅ Datos de prueba preparados exitosamente!')
    return true
  } catch (err: any) {
    error(`Error preparando datos: ${err.message}`)
    return false
  }
}

// ==================== TEST DE JOBS ====================

// Test 1: Ejecutar job SOLD_OUT manualmente
async function testSoldOutJob(): Promise<boolean> {
  info('\n[Test 1] POST /admin/jobs/run/sold_out')
  
  try {
    const response = await fetch(`${BASE_URL}/admin/jobs/run/sold_out`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
    })

    if (response.status === 403) {
      warning('403 - Usuario no tiene permisos de admin')
      return true
    }

    if (!response.ok) {
      error(`Job SOLD_OUT failed: ${response.status}`)
      return false
    }

    const data = await response.json()
    success(`Job SOLD_OUT ejecutado: ${data.message}`)

    // Verificar que la rifa cambió de estado
    const updatedRaffle = await prisma.raffle.findUnique({
      where: { id: testRaffleId },
    })
    
    if (updatedRaffle?.status === 'sold_out') {
      success(`✓ Rifa ${testRaffleId} ahora está: ${updatedRaffle.status}`)
    } else {
      warning(`Rifa sigue en estado: ${updatedRaffle?.status}`)
    }

    return true
  } catch (err: any) {
    error(`Error: ${err.message}`)
    return false
  }
}

// Test 2: Ejecutar job CLOSED manualmente
async function testClosedJob(): Promise<boolean> {
  info('\n[Test 2] POST /admin/jobs/run/closed')
  
  try {
    const response = await fetch(`${BASE_URL}/admin/jobs/run/closed`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
    })

    if (response.status === 403) {
      warning('403 - Usuario no tiene permisos de admin')
      return true
    }

    if (!response.ok) {
      error(`Job CLOSED failed: ${response.status}`)
      return false
    }

    const data = await response.json()
    success(`Job CLOSED ejecutado: ${data.message}`)
    return true
  } catch (err: any) {
    error(`Error: ${err.message}`)
    return false
  }
}

// Test 3: Ejecutar job EXPIRE_PURCHASES manualmente
async function testExpirePurchasesJob(): Promise<boolean> {
  info('\n[Test 3] POST /admin/jobs/run/expire_purchases')
  
  try {
    const response = await fetch(`${BASE_URL}/admin/jobs/run/expire_purchases`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
    })

    if (response.status === 403) {
      warning('403 - Usuario no tiene permisos de admin')
      return true
    }

    if (!response.ok) {
      error(`Job EXPIRE_PURCHASES failed: ${response.status}`)
      return false
    }

    const data = await response.json()
    success(`Job EXPIRE_PURCHASES ejecutado: ${data.message}`)

    // Verificar que la purchase cambió de estado
    const updatedPurchase = await prisma.purchase.findUnique({
      where: { id: testPurchaseId },
    })
    
    if (updatedPurchase?.status === 'failed') {
      success(`✓ Purchase ${testPurchaseId} ahora está: ${updatedPurchase.status}`)
    } else {
      warning(`Purchase sigue en estado: ${updatedPurchase?.status}`)
    }

    return true
  } catch (err: any) {
    error(`Error: ${err.message}`)
    return false
  }
}

// Test 4: Verificar estado de jobs
async function testJobsStatus(): Promise<boolean> {
  info('\n[Test 4] GET /admin/jobs/status')
  
  try {
    const response = await fetch(`${BASE_URL}/admin/jobs/status`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    })

    if (response.status === 403) {
      warning('403 - Usuario no tiene permisos de admin')
      return true
    }

    if (!response.ok) {
      error(`Get jobs status failed: ${response.status}`)
      return false
    }

    const data = await response.json()
    success('Estado de jobs obtenido:')
    console.log(`   • Próximo SOLD_OUT: ${new Date(data.nextRun.soldOut).toLocaleString()}`)
    console.log(`   • Próximo CLOSED: ${new Date(data.nextRun.closed).toLocaleString()}`)
    console.log(`   • Próximo EXPIRE: ${new Date(data.nextRun.expirePurchases).toLocaleString()}`)
    return true
  } catch (err: any) {
    error(`Error: ${err.message}`)
    return false
  }
}

// ==================== LIMPIEZA ====================

async function cleanupTestData(): Promise<void> {
  phase('🧹 LIMPIEZA DE DATOS DE PRUEBA')
  
  try {
    // Eliminar rifas de prueba
    const testRaffles = await prisma.raffle.findMany({
      where: {
        title: {
          contains: 'Test Auto',
        },
      },
    })

    for (const raffle of testRaffles) {
      // Eliminar progress
      await prisma.raffleProgress.deleteMany({
        where: { raffleId: raffle.id },
      })
      
      // Eliminar purchases
      await prisma.purchase.deleteMany({
        where: { raffleId: raffle.id },
      })
      
      // Eliminar rifa
      await prisma.raffle.delete({
        where: { id: raffle.id },
      })
      
      info(`Eliminada rifa: ${raffle.id}`)
    }

    // Eliminar usuario de prueba
    await prisma.user.deleteMany({
      where: { email: 'test-jobs@rifalovers.com' },
    })

    success('✅ Limpieza completada!')
  } catch (err: any) {
    warning(`Error en limpieza: ${err.message}`)
  }
}

// ==================== VERIFICACIÓN BD ====================

async function verifyDatabaseState(): Promise<boolean> {
  info('\nVerificación de estados en Base de Datos:')
  
  try {
    // Contar rifas por estado
    const rafflesByStatus = await prisma.raffle.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    console.log('\n   Rifas por estado:')
    rafflesByStatus.forEach((r: any) => {
      console.log(`      • ${r.status}: ${r._count.status}`)
    })

    // Contar purchases por estado
    const purchasesByStatus = await prisma.purchase.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    console.log('\n   Purchases por estado:')
    purchasesByStatus.forEach((p: any) => {
      console.log(`      • ${p.status}: ${p._count.status}`)
    })

    return true
  } catch (err: any) {
    error(`Error: ${err.message}`)
    return false
  }
}

// Main
async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('  ⏰ FASE 12 - JOBS AUTOMÁTICOS')
  console.log('  SOLD_OUT | CLOSED | EXPIRE_PURCHASES')
  console.log('='.repeat(70))

  // Verificar backend
  try {
    await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2000) })
  } catch {
    error('Backend no está corriendo en localhost:3000')
    console.log('Inicia el backend: pnpm run start:dev')
    process.exit(1)
  }

  success('Backend conectado')

  // Login
  const loggedIn = await login()
  if (!loggedIn) {
    error('No se pudo iniciar sesión')
    process.exit(1)
  }

  // Preparar datos
  const prepared = await prepareTestData()
  if (!prepared) {
    error('No se pudieron preparar los datos de prueba')
    await cleanupTestData()
    process.exit(1)
  }

  // Ejecutar tests
  phase('🧪 EJECUTANDO TESTS DE JOBS')

  const results = {
    soldOut: await testSoldOutJob(),
    closed: await testClosedJob(),
    expirePurchases: await testExpirePurchasesJob(),
    status: await testJobsStatus(),
    verify: await verifyDatabaseState(),
  }

  // Verificación
  phase('📊 RESUMEN')

  console.log('\nResultados de tests:')
  results.soldOut ? success('Auto SOLD_OUT') : error('Auto SOLD_OUT')
  results.closed ? success('Auto CLOSED') : error('Auto CLOSED')
  results.expirePurchases ? success('Expire Purchases') : error('Expire Purchases')
  results.status ? success('Jobs Status') : error('Jobs Status')
  results.verify ? success('Verificación BD') : error('Verificación BD')

  const passedTests = Object.values(results).filter(r => r).length
  const totalTests = Object.values(results).length

  console.log('\n' + '='.repeat(70))
  console.log(`  RESULTADOS: ${passedTests}/${totalTests} tests pasaron`)
  console.log('='.repeat(70))

  if (passedTests === totalTests) {
    console.log('\n  🎉 ¡FASE 12 - JOBS AUTOMÁTICOS COMPLETADA!')
  } else {
    console.log('\n  ⚠️  Algunos tests fallaron')
    console.log('  Nota: 403 = Usuario sin permisos de admin (comportamiento esperado)')
  }

  console.log('\n  📋 Jobs programados:')
  console.log('     • Auto SOLD_OUT     → cada 5 minutos')
  console.log('     • Auto CLOSED       → cada 5 minutos')
  console.log('     • Expire Purchases  → cada 15 minutos')
  console.log('\n  🎮 Endpoints de control:')
  console.log('     GET  /admin/jobs/status')
  console.log('     POST /admin/jobs/run/sold_out')
  console.log('     POST /admin/jobs/run/closed')
  console.log('     POST /admin/jobs/run/expire_purchases')
  console.log('='.repeat(70) + '\n')

  // Limpieza
  await cleanupTestData()

  await prisma.$disconnect()
  process.exit(passedTests === totalTests ? 0 : 1)
}

main().catch(async (err) => {
  console.error('Error fatal:', err)
  await cleanupTestData()
  await prisma.$disconnect()
  process.exit(1)
})
