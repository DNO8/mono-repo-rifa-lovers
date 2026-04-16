/**
 * Script para simular el webhook de Flow.cl
 * Uso: node simulate-flow-webhook.js <purchaseId> <backendUrl>
 * 
 * Ejemplo:
 * node simulate-flow-webhook.js abc-123 http://localhost:3000
 */

const crypto = require('crypto')

// Configuración
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY || 'test-secret-key'
const DEFAULT_BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

function generateSignature(payload, secret) {
  // Flow usa el mismo algoritmo de firma
  const keys = Object.keys(payload).sort()
  let toSign = ''
  
  keys.forEach((key) => {
    if (key === 's') return // No incluir la firma misma
    if (payload[key] !== undefined && payload[key] !== null && payload[key] !== '') {
      toSign += payload[key].toString()
    }
  })
  
  return crypto.createHmac('sha256', secret).update(toSign).digest('hex')
}

async function simulateWebhook(purchaseId, backendUrl, status = 'success') {
  const flowStatus = status === 'success' ? 2 : status === 'rejected' ? 3 : 1
  
  const payload = {
    token: `test-token-${Date.now()}`,
    flowOrder: Math.floor(Math.random() * 1000000).toString(),
    commerceId: process.env.FLOW_COMMERCE_ID || 'test-commerce',
    status: flowStatus,
    subject: 'Test Purchase',
    currency: 'CLP',
    amount: 2990,
    email: 'test@example.com',
    commerceOrder: purchaseId,
    requestDate: new Date().toISOString(),
    paymentData: JSON.stringify({
      date: new Date().toISOString(),
      media: 'webpay',
      amount: 2990,
      currency: 'CLP',
    }),
  }

  // Generar firma
  const signature = generateSignature(payload, FLOW_SECRET_KEY)
  payload.s = signature

  console.log('🚀 Enviando webhook simulado a Flow...')
  console.log('Payload:', JSON.stringify(payload, null, 2))
  console.log('Firma:', signature)

  try {
    const url = `${backendUrl}/webhooks/flow`
    console.log('URL:', url)

    // Convertir a form-urlencoded
    const formData = new URLSearchParams()
    Object.keys(payload).forEach(key => {
      formData.append(key, payload[key])
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Webhook procesado exitosamente')
      console.log('Respuesta:', JSON.stringify(result, null, 2))
    } else {
      console.error('❌ Error procesando webhook:', response.status)
      console.error('Respuesta:', result)
    }
    
    return { success: response.ok, status: response.status, result }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message)
    return { success: false, error: error.message }
  }
}

// Main
async function main() {
  const args = process.argv.slice(2)
  const purchaseId = args[0]
  const backendUrl = args[1] || DEFAULT_BACKEND_URL
  const status = args[2] || 'success'

  if (!purchaseId) {
    console.log(`
Uso: node simulate-flow-webhook.js <purchaseId> [backendUrl] [status]

Argumentos:
  purchaseId  - ID de la compra (requerido)
  backendUrl  - URL del backend (default: ${DEFAULT_BACKEND_URL})
  status      - Estado del pago: success | rejected | pending (default: success)

Ejemplo:
  node simulate-flow-webhook.js abc-123 http://localhost:3000 success
  node simulate-flow-webhook.js abc-123 http://localhost:3000 rejected
`)
    process.exit(1)
  }

  console.log(`\n🧪 Simulando webhook de Flow.cl`)
  console.log(`   Purchase ID: ${purchaseId}`)
  console.log(`   Backend URL: ${backendUrl}`)
  console.log(`   Status: ${status}\n`)

  const result = await simulateWebhook(purchaseId, backendUrl, status)
  
  if (result.success) {
    console.log('\n✅ Webhook simulado completado')
    
    // Verificar estado de la compra
    console.log('\n🔍 Verificando estado de la compra...')
    try {
      const checkResponse = await fetch(`${backendUrl}/purchases/${purchaseId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN || ''}`,
        },
      })
      
      if (checkResponse.ok) {
        const purchase = await checkResponse.json()
        console.log('Estado actual:', purchase.status)
      }
    } catch (e) {
      console.log('No se pudo verificar estado (necesita auth token)')
    }
  } else {
    console.log('\n❌ Webhook falló')
    process.exit(1)
  }
}

main()
