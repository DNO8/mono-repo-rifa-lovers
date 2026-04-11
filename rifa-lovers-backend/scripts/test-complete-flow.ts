/**
 * Script de prueba del flujo completo: Fase 6 + 7 + 8
 * 
 * Flujo:
 * 1. Login
 * 2. Crear compra (Fase 6)
 * 3. Listar packs (Fase 7)
 * 4. Iniciar pago con Flow (Fase 8)
 * 
 * Uso:
 *   1. Backend corriendo en localhost:3000
 *   2. Actualizar credenciales
 *   3. Ejecutar: npx tsx scripts/test-complete-flow.ts
 */

const BASE_URL = 'http://localhost:3000'

const TEST_CREDENTIALS = {
  email: 'dcontrerasl@live.com',
  password: '123456789',
}

let authToken: string
let createdPurchaseId: string

async function login(): Promise<string> {
  console.log('🔐 1. Login...')
  
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_CREDENTIALS),
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`)
  }

  const data = await response.json()
  authToken = data.accessToken
  console.log('✅ Login exitoso\n')
  return authToken
}

async function testPacks() {
  console.log('📦 2. Verificar packs (Fase 7)...')
  
  const response = await fetch(`${BASE_URL}/packs`)
  
  if (!response.ok) {
    throw new Error(`Get packs failed: ${response.status}`)
  }

  const packs = await response.json()
  console.log(`✅ ${packs.length} packs disponibles:`)
  packs.forEach((p: any) => {
    console.log(`   • ${p.name}: $${p.price} (${p.luckyPassQuantity} LuckyPasses)`)
  })
  console.log('')
  return packs
}

async function createPurchase() {
  console.log('🛒 3. Crear compra (Fase 6)...')
  
  const response = await fetch(`${BASE_URL}/purchases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      raffleId: 'c2a8d479-4b52-4024-9a8c-7c20979ab768',
      packId: 'eb473bad-83c1-42b5-a13d-9f803a6b7ea3',
      quantity: 2,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Create purchase failed: ${response.status} - ${error}`)
  }

  const purchase = await response.json()
  createdPurchaseId = purchase.id
  console.log('✅ Compra creada:')
  console.log(`   ID: ${purchase.id}`)
  console.log(`   Total: $${purchase.totalAmount}`)
  console.log(`   Status: ${purchase.status}`)
  console.log(`   Pack: ${purchase.packName}`)
  console.log('')
  return purchase
}

async function initiatePayment() {
  console.log('💳 4. Iniciar pago con Flow (Fase 8)...')
  
  const response = await fetch(`${BASE_URL}/payments/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      purchaseId: createdPurchaseId,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Initiate payment failed: ${response.status} - ${error}`)
  }

  const payment = await response.json()
  console.log('✅ Pago iniciado:')
  console.log(`   Flow Order ID: ${payment.flowOrderId}`)
  console.log(`   Payment URL: ${payment.paymentUrl}`)
  console.log(`   Token: ${payment.token.substring(0, 20)}...`)
  console.log('')
  return payment
}

async function main() {
  console.log('🚀 PRUEBA COMPLETA: Fase 6 + 7 + 8')
  console.log('=' .repeat(60))

  try {
    await login()
    await testPacks()
    await createPurchase()
    await initiatePayment()

    console.log('='.repeat(60))
    console.log('✨ FLUJO COMPLETO FUNCIONANDO')
    console.log('')
    console.log('Resumen:')
    console.log('  ✅ Fase 6: Compras con transacción (Purchase + UserPack + Payment)')
    console.log('  ✅ Fase 7: Packs dinámicos desde API')
    console.log('  ✅ Fase 8: Integración Flow (crear orden de pago)')
    console.log('')
    console.log('Próximo paso: Completar pago en Flow.cl sandbox')
    console.log('  URL: https://sandbox.flow.cl')
    
  } catch (error: any) {
    console.error('\n❌ ERROR:')
    console.error(error.message)
    process.exit(1)
  }
}

main()
