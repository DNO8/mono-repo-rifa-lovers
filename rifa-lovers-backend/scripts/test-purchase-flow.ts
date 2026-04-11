/**
 * Script de prueba para el flujo de compras (Fase 6)
 * 
 * Uso:
 *   1. Asegúrate de que el backend esté corriendo en localhost:3000
 *   2. Actualiza las credenciales de login abajo (email y password)
 *   3. Ejecuta: npx tsx scripts/test-purchase-flow.ts
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config()

const BASE_URL = 'http://localhost:3000'

// ⚠️ ACTUALIZA ESTAS CREDENCIALES CON UN USUARIO REAL DE TU BD
const TEST_CREDENTIALS = {
  email: 'dcontrerasl@live.com',  // ← Cambia esto
  password: '123456789',    // ← Cambia esto
}

// IDs de prueba (deben existir en tu BD)
const TEST_DATA = {
  raffleId: 'c2a8d479-4b52-4024-9a8c-7c20979ab768',
  packId: 'eb473bad-83c1-42b5-a13d-9f803a6b7ea3',  // Pack Popular
  quantity: 2,
  selectedNumber: 1234,
}

async function login(): Promise<string> {
  console.log('🔐 Paso 1: Login...')
  
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_CREDENTIALS),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Login failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  console.log('✅ Login exitoso')
  console.log(`   Token: ${data.accessToken?.substring(0, 30)}...`)
  return data.accessToken
}

async function createPurchase(token: string) {
  console.log('\n🛒 Paso 2: Crear compra...')
  console.log(`   Rifa: ${TEST_DATA.raffleId}`)
  console.log(`   Pack: ${TEST_DATA.packId}`)
  console.log(`   Cantidad: ${TEST_DATA.quantity}`)

  const response = await fetch(`${BASE_URL}/purchases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      raffleId: TEST_DATA.raffleId,
      packId: TEST_DATA.packId,
      quantity: TEST_DATA.quantity,
      selectedNumber: TEST_DATA.selectedNumber,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Create purchase failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  console.log('✅ Compra creada exitosamente!')
  console.log(`   Purchase ID: ${data.id}`)
  console.log(`   Status: ${data.status}`)
  console.log(`   Total: $${data.totalAmount}`)
  console.log(`   Rifa: ${data.raffleName}`)
  console.log(`   Pack: ${data.packName}`)
  console.log(`   Cantidad: ${data.quantity}`)
  
  return data
}

async function getMyPurchases(token: string) {
  console.log('\n📋 Paso 3: Ver compras del usuario...')

  const response = await fetch(`${BASE_URL}/purchases/my`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Get purchases failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  console.log(`✅ Encontradas ${data.length} compras`)
  data.forEach((p: any, i: number) => {
    console.log(`   ${i + 1}. ${p.raffleName} - $${p.totalAmount} - ${p.status}`)
  })
  
  return data
}

async function verifyDatabase(purchaseId: string) {
  console.log('\n🔍 Paso 4: Verificar en base de datos...')
  
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.log('   ⚠️ DATABASE_URL no definida, saltando verificación de BD')
    return
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl })
  const prisma = new PrismaClient({ adapter })

  try {
    // Verificar Purchase
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { userPacks: true, paymentTransactions: true },
    })

    if (!purchase) {
      throw new Error('Purchase no encontrada en BD')
    }

    console.log('✅ Purchase en BD:')
    console.log(`   ID: ${purchase.id}`)
    console.log(`   Status: ${purchase.status}`)
    console.log(`   Total: $${purchase.totalAmount?.toString()}`)
    console.log(`   UserPacks: ${purchase.userPacks.length} registros`)
    console.log(`   PaymentTransactions: ${purchase.paymentTransactions.length} registros`)

    if (purchase.userPacks.length > 0) {
      console.log('✅ UserPack creado:')
      const up = purchase.userPacks[0]
      console.log(`   ID: ${up.id}`)
      console.log(`   Quantity: ${up.quantity}`)
      console.log(`   Total Paid: $${up.totalPaid?.toString()}`)
    }

    if (purchase.paymentTransactions.length > 0) {
      console.log('✅ PaymentTransaction creada:')
      const pt = purchase.paymentTransactions[0]
      console.log(`   ID: ${pt.id}`)
      console.log(`   Provider: ${pt.provider}`)
      console.log(`   Status: ${pt.status}`)
      console.log(`   Amount: $${pt.amount?.toString()}`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  console.log('🚀 Iniciando prueba de flujo de compras (Fase 6)')
  console.log('=' .repeat(50))

  try {
    // Paso 1: Login
    const token = await login()

    // Paso 2: Crear compra
    const purchase = await createPurchase(token)

    // Paso 3: Ver compras
    await getMyPurchases(token)

    // Paso 4: Verificar en BD
    await verifyDatabase(purchase.id)

    console.log('\n' + '='.repeat(50))
    console.log('✨ TODAS LAS PRUEBAS PASARON EXITOSAMENTE')
    console.log('✅ Fase 6: Flujo de compras implementado correctamente')
    
  } catch (error: any) {
    console.error('\n❌ ERROR EN PRUEBA:')
    console.error(error.message)
    process.exit(1)
  }
}

main()
