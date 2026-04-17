import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { JwtService, JwtModule } from '@nestjs/jwt'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/database/prisma.service'
import * as dotenv from 'dotenv'
import { randomUUID } from 'crypto'

// Cargar variables de entorno para tests
dotenv.config()

/**
 * Test E2E del flujo completo de la aplicación
 * 
 * Flujo: register → login → get raffle active → get packs
 * → create purchase → create payment → simulate webhook
 * → verify lucky-passes generated → run draw → verify winners
 */
describe('AppController (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwtService: JwtService
  let authToken: string
  let userId: string
  let raffleId: string
  let packId: string
  let purchaseId: string
  let paymentToken: string
  let adminTestEmail: string
  let testEmail: string

  // Polling helper to replace hardcoded setTimeout
  async function waitForCondition(
    fn: () => Promise<boolean>,
    timeoutMs = 5000,
    intervalMs = 250,
  ): Promise<void> {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      if (await fn()) return
      await new Promise((r) => setTimeout(r, intervalMs))
    }
    throw new Error('waitForCondition timed out')
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'test-secret-key',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        {
          provide: JwtService,
          useValue: new JwtService({
            secret: process.env.JWT_SECRET || 'test-secret-key',
            signOptions: { expiresIn: '1h' },
          }),
        },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    
    prisma = moduleFixture.get<PrismaService>(PrismaService)
    jwtService = moduleFixture.get<JwtService>(JwtService)
    
    await app.init()

    // Limpiar datos de test previos
    await cleanupTestData(prisma)
  })

  afterAll(async () => {
    await cleanupTestData(prisma)
    await app.close()
  })

  describe('=== FASE 1: AUTENTICACIÓN ===', () => {
    const testPassword = 'TestPassword123!'

    beforeAll(() => {
      testEmail = `test-${Date.now()}@rifalovers.cl`
    })

    it('1.1 - POST /auth/register - debe registrar un nuevo usuario', async () => {
      const registerData = {
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'E2E',
        phone: '56912345678',
      }

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(201)

      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(testEmail)
      expect(response.body.user.role).toBe('customer')
      
      authToken = response.body.accessToken
      userId = response.body.user.id
    })

    it('1.2 - POST /auth/login - debe iniciar sesión con credenciales válidas', async () => {
      const loginData = {
        email: testEmail,
        password: testPassword,
      }

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(testEmail)
      
      // Actualizar token
      authToken = response.body.accessToken
    })

    it('1.3 - GET /users/me - debe retornar datos del usuario autenticado', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('email')
      expect(response.body.email).toBe(testEmail)
    })
  })

  describe('=== FASE 2: CATÁLOGO (RAFFLES & PACKS) ===', () => {
    it('2.1 - GET /raffles/active - debe retornar rifa activa', async () => {
      // Crear una rifa de test si no existe
      const raffle = await prisma.raffle.create({
        data: {
          id: randomUUID(),
          title: 'Rifa Test E2E',
          description: 'Rifa para testing E2E',
          status: 'active',
          goalPacks: 100,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })
      raffleId = raffle.id

      const response = await request(app.getHttpServer())
        .get('/raffles/active')
        .expect(200)

      expect(response.body).toHaveProperty('id')
      expect(response.body.title).toBe('Rifa Test E2E')
      expect(response.body.status).toBe('active')
    })

    it('2.2 - GET /packs - debe retornar lista de packs disponibles', async () => {
      // Crear pack de test
      const pack = await prisma.pack.create({
        data: {
          id: randomUUID(),
          name: 'Pack Test E2E',
          price: 2990,
          luckyPassQuantity: 1,
        },
      })
      packId = pack.id

      const response = await request(app.getHttpServer())
        .get('/packs')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
      
      const testPack = response.body.find((p: any) => p.id === packId)
      expect(testPack).toBeDefined()
      expect(testPack.name).toBe('Pack Test E2E')
    })
  })

  describe('=== FASE 3: COMPRA Y PAGO ===', () => {
    it('3.1 - POST /purchases - debe crear una compra pendiente', async () => {
      const purchaseData = {
        raffleId: raffleId,
        packId: packId,
        quantity: 1,
      }

      const response = await request(app.getHttpServer())
        .post('/purchases')
        .set('Authorization', `Bearer ${authToken}`)
        .send(purchaseData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('status')
      expect(response.body.status).toBe('pending')
      expect(response.body.raffleId).toBe(raffleId)
      expect(response.body.totalAmount).toBeGreaterThan(0)
      
      purchaseId = response.body.id
    })

    it('3.2 - POST /payments/initiate - debe iniciar el pago con Flow', async () => {
      const paymentData = {
        purchaseId: purchaseId,
      }

      const response = await request(app.getHttpServer())
        .post('/payments/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(201)

      expect(response.body).toHaveProperty('purchaseId')
      expect(response.body).toHaveProperty('flowOrderId')
      expect(response.body).toHaveProperty('paymentUrl')
      expect(response.body).toHaveProperty('token')
      expect(response.body.purchaseId).toBe(purchaseId)
      
      paymentToken = response.body.token
    })

    it('3.3 - POST /webhooks/flow - debe procesar webhook de Flow (simulado)', async () => {
      // Simular la firma de Flow (necesitaríamos la clave secreta real para test de integración completo)
      // Por ahora, simulamos el payload que enviaría Flow
      const webhookPayload = {
        token: paymentToken,
        flowOrder: '12345',
        commerceId: process.env.FLOW_COMMERCE_ID || 'test-commerce',
        status: 2, // Pagado
        subject: `Rifa Lovers - Rifa Test E2E`,
        currency: 'CLP',
        amount: 2990,
        email: 'test-e2e@rifalovers.cl',
        commerceOrder: purchaseId,
        requestDate: new Date().toISOString(),
        paymentData: {
          date: new Date().toISOString(),
          media: 'webpay',
          conversionDate: new Date().toISOString(),
          conversionRate: 1,
          amount: 2990,
          currency: 'CLP',
          fee: 0,
          balance: 2990,
          transferDate: null,
        },
      }

      // Calcular firma (simplificado para test)
      const crypto = require('crypto')
      const secretKey = process.env.FLOW_SECRET_KEY || 'test-secret'
      const keys = Object.keys(webhookPayload).sort()
      let toSign = ''
      keys.forEach((key) => {
        if (webhookPayload[key] !== undefined && webhookPayload[key] !== null) {
          toSign += webhookPayload[key].toString()
        }
      })
      const signature = crypto.createHmac('sha256', secretKey).update(toSign).digest('hex')

      const response = await request(app.getHttpServer())
        .post('/webhooks/flow')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({ ...webhookPayload, s: signature })
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toBe('Webhook procesado')
    })

    it('3.4 - GET /purchases/my - debe mostrar la compra como pagada', async () => {
      // Poll until the webhook has been processed and purchase is paid
      await waitForCondition(async () => {
        const res = await request(app.getHttpServer())
          .get('/purchases/my')
          .set('Authorization', `Bearer ${authToken}`)
        const purchase = res.body.find((p: any) => p.id === purchaseId)
        return purchase?.status === 'paid'
      })

      const response = await request(app.getHttpServer())
        .get('/purchases/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      
      const purchase = response.body.find((p: any) => p.id === purchaseId)
      expect(purchase).toBeDefined()
      expect(purchase.status).toBe('paid')
    })
  })

  describe('=== FASE 4: LUCKY PASSES ===', () => {
    it('4.1 - GET /lucky-passes/my - debe retornar lucky passes generados', async () => {
      const response = await request(app.getHttpServer())
        .get('/lucky-passes/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
      
      // Verificar que tenemos al menos un lucky pass para la rifa de test
      const testPasses = response.body.filter((lp: any) => lp.raffleId === raffleId)
      expect(testPasses.length).toBeGreaterThan(0)
      
      // Verificar estructura
      testPasses.forEach((pass: any) => {
        expect(pass).toHaveProperty('id')
        expect(pass).toHaveProperty('ticketNumber')
        expect(pass).toHaveProperty('status')
        expect(pass.status).toBe('active')
      })
    })

    it('4.2 - GET /lucky-passes/my/summary - debe retornar resumen', async () => {
      const response = await request(app.getHttpServer())
        .get('/lucky-passes/my/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('totalPasses')
      expect(response.body).toHaveProperty('activePasses')
      expect(response.body).toHaveProperty('byRaffle')
      expect(response.body.totalPasses).toBeGreaterThan(0)
    })
  })

  describe('=== FASE 5: SORTEO (DRAW) ===', () => {
    it('5.1 - Preparar rifa para sorteo (cerrarla)', async () => {
      // Actualizar la rifa a estado 'closed' para permitir el sorteo
      await prisma.raffle.update({
        where: { id: raffleId },
        data: { status: 'closed' },
      })

      // Crear milestone desbloqueado para la rifa
      const milestone = await prisma.milestone.create({
        data: {
          raffleId: raffleId,
          name: 'Meta Test E2E',
          requiredPacks: 1,
          sortOrder: 1,
          isUnlocked: true,
        },
      })

      // Crear premio para la rifa
      await prisma.prize.create({
        data: {
          raffleId: raffleId,
          milestoneId: milestone.id,
          type: 'milestone',
          name: 'Premio Test E2E',
          description: 'Premio para testing',
        },
      })

      // Marcar el sorteo como listo
      const raffle = await prisma.raffle.findUnique({
        where: { id: raffleId },
      })
      
      expect(raffle?.status).toBe('closed')
    })

    it('5.2 - POST /admin/raffles/:id/draw - debe ejecutar el sorteo', async () => {
      // Crear usuario admin via API para que exista en Supabase
      adminTestEmail = `admin-${Date.now()}@rifalovers.cl`
      const adminRegisterData = {
        email: adminTestEmail,
        password: 'AdminPass123!',
        firstName: 'Admin',
        lastName: 'Test',
        phone: '56987654321',
      }

      // Registrar admin
      const adminRegResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(adminRegisterData)
        .expect(201)

      const adminId = adminRegResponse.body.user.id

      // Actualizar rol a admin directamente en DB (bypass de Supabase para tests)
      await prisma.user.update({
        where: { id: adminId },
        data: { role: 'admin' },
      })

      // Login para obtener token válido
      const adminLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: adminRegisterData.email,
          password: adminRegisterData.password,
        })
        .expect(200)

      const adminToken = adminLoginResponse.body.accessToken

      const response = await request(app.getHttpServer())
        .post(`/admin/raffles/${raffleId}/draw`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201)

      expect(response.body).toHaveProperty('raffleId')
      expect(response.body).toHaveProperty('winners')
      expect(response.body).toHaveProperty('drawnAt')
      expect(response.body.raffleId).toBe(raffleId)
      expect(response.body.winners.length).toBeGreaterThan(0)
      
      // Verificar estructura de ganadores
      response.body.winners.forEach((winner: any) => {
        expect(winner).toHaveProperty('prizeId')
        expect(winner).toHaveProperty('prizeName')
        expect(winner).toHaveProperty('passNumber')
        expect(winner).toHaveProperty('winnerName')
      })
    })

    it('5.3 - GET /raffles/:id/winners - debe retornar resultados del sorteo', async () => {
      const response = await request(app.getHttpServer())
        .get(`/raffles/${raffleId}/winners`)
        .expect(200)

      expect(response.body).toHaveProperty('raffleId')
      expect(response.body).toHaveProperty('winners')
      expect(response.body).toHaveProperty('drawnAt')
      expect(response.body.raffleId).toBe(raffleId)
      expect(response.body.winners.length).toBeGreaterThan(0)
    })
  })
})

// Función helper para limpiar datos de test
async function cleanupTestData(prisma: PrismaService) {
  try {
    // Eliminar en orden inverso para respetar foreign keys
    await prisma.prizeWinner.deleteMany({
      where: {
        prize: {
          raffle: {
            title: 'Rifa Test E2E',
          },
        },
      },
    })
    
    await prisma.luckyPass.deleteMany({
      where: {
        raffle: {
          title: 'Rifa Test E2E',
        },
      },
    })

    await prisma.paymentTransaction.deleteMany({
      where: {
        purchase: {
          raffle: {
            title: 'Rifa Test E2E',
          },
        },
      },
    })

    await prisma.userPack.deleteMany({
      where: {
        purchase: {
          raffle: {
            title: 'Rifa Test E2E',
          },
        },
      },
    })

    await prisma.purchase.deleteMany({
      where: {
        raffle: {
          title: 'Rifa Test E2E',
        },
      },
    })

    await prisma.prize.deleteMany({
      where: {
        raffle: {
          title: 'Rifa Test E2E',
        },
      },
    })

    await prisma.milestone.deleteMany({
      where: {
        raffle: {
          title: 'Rifa Test E2E',
        },
      },
    })

    await prisma.raffleProgress.deleteMany({
      where: {
        raffle: {
          title: 'Rifa Test E2E',
        },
      },
    })

    await prisma.raffle.deleteMany({
      where: { title: 'Rifa Test E2E' },
    })

    await prisma.pack.deleteMany({
      where: { name: 'Pack Test E2E' },
    })

    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: 'test-' } },
          { email: { contains: 'admin-' } },
        ],
      },
    })
  } catch (error) {
    console.log('Cleanup error (ignorando):', error.message)
  }
}
