"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("../src/app.module");
const prisma_service_1 = require("../src/database/prisma.service");
const dotenv = __importStar(require("dotenv"));
const crypto_1 = require("crypto");
dotenv.config();
describe('AppController (e2e)', () => {
    let app;
    let prisma;
    let jwtService;
    let authToken;
    let userId;
    let raffleId;
    let packId;
    let purchaseId;
    let paymentToken;
    let adminTestEmail;
    let testEmail;
    async function waitForCondition(fn, timeoutMs = 5000, intervalMs = 250) {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            if (await fn())
                return;
            await new Promise((r) => setTimeout(r, intervalMs));
        }
        throw new Error('waitForCondition timed out');
    }
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [
                app_module_1.AppModule,
                jwt_1.JwtModule.register({
                    secret: process.env.JWT_SECRET || 'test-secret-key',
                    signOptions: { expiresIn: '1h' },
                }),
            ],
            providers: [
                {
                    provide: jwt_1.JwtService,
                    useValue: new jwt_1.JwtService({
                        secret: process.env.JWT_SECRET || 'test-secret-key',
                        signOptions: { expiresIn: '1h' },
                    }),
                },
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
        prisma = moduleFixture.get(prisma_service_1.PrismaService);
        jwtService = moduleFixture.get(jwt_1.JwtService);
        await app.init();
        await cleanupTestData(prisma);
    });
    afterAll(async () => {
        await cleanupTestData(prisma);
        await app.close();
    });
    describe('=== FASE 1: AUTENTICACIÓN ===', () => {
        const testPassword = 'TestPassword123!';
        beforeAll(() => {
            testEmail = `test-${Date.now()}@rifalovers.cl`;
        });
        it('1.1 - POST /auth/register - debe registrar un nuevo usuario', async () => {
            const registerData = {
                email: testEmail,
                password: testPassword,
                firstName: 'Test',
                lastName: 'E2E',
                phone: '56912345678',
            };
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/register')
                .send(registerData)
                .expect(201);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(testEmail);
            expect(response.body.user.role).toBe('customer');
            authToken = response.body.accessToken;
            userId = response.body.user.id;
        });
        it('1.2 - POST /auth/login - debe iniciar sesión con credenciales válidas', async () => {
            const loginData = {
                email: testEmail,
                password: testPassword,
            };
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/login')
                .send(loginData)
                .expect(200);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(testEmail);
            authToken = response.body.accessToken;
        });
        it('1.3 - GET /users/me - debe retornar datos del usuario autenticado', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/users/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('email');
            expect(response.body.email).toBe(testEmail);
        });
    });
    describe('=== FASE 2: CATÁLOGO (RAFFLES & PACKS) ===', () => {
        it('2.1 - GET /raffles/active - debe retornar rifa activa', async () => {
            const raffle = await prisma.raffle.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    title: 'Rifa Test E2E',
                    description: 'Rifa para testing E2E',
                    status: 'active',
                    goalPacks: 100,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
            raffleId = raffle.id;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/raffles/active')
                .expect(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body.title).toBe('Rifa Test E2E');
            expect(response.body.status).toBe('active');
        });
        it('2.2 - GET /packs - debe retornar lista de packs disponibles', async () => {
            const pack = await prisma.pack.create({
                data: {
                    id: (0, crypto_1.randomUUID)(),
                    name: 'Pack Test E2E',
                    price: 2990,
                    luckyPassQuantity: 1,
                },
            });
            packId = pack.id;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/packs')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            const testPack = response.body.find((p) => p.id === packId);
            expect(testPack).toBeDefined();
            expect(testPack.name).toBe('Pack Test E2E');
        });
    });
    describe('=== FASE 3: COMPRA Y PAGO ===', () => {
        it('3.1 - POST /purchases - debe crear una compra pendiente', async () => {
            const purchaseData = {
                raffleId: raffleId,
                packId: packId,
                quantity: 1,
            };
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/purchases')
                .set('Authorization', `Bearer ${authToken}`)
                .send(purchaseData)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('pending');
            expect(response.body.raffleId).toBe(raffleId);
            expect(response.body.totalAmount).toBeGreaterThan(0);
            purchaseId = response.body.id;
        });
        it('3.2 - POST /payments/initiate - debe iniciar el pago con Flow', async () => {
            const paymentData = {
                purchaseId: purchaseId,
            };
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/payments/initiate')
                .set('Authorization', `Bearer ${authToken}`)
                .send(paymentData)
                .expect(201);
            expect(response.body).toHaveProperty('purchaseId');
            expect(response.body).toHaveProperty('flowOrderId');
            expect(response.body).toHaveProperty('paymentUrl');
            expect(response.body).toHaveProperty('token');
            expect(response.body.purchaseId).toBe(purchaseId);
            paymentToken = response.body.token;
        });
        it('3.3 - POST /webhooks/flow - debe procesar webhook de Flow (simulado)', async () => {
            const webhookPayload = {
                token: paymentToken,
                flowOrder: '12345',
                commerceId: process.env.FLOW_COMMERCE_ID || 'test-commerce',
                status: 2,
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
            };
            const crypto = require('crypto');
            const secretKey = process.env.FLOW_SECRET_KEY || 'test-secret';
            const keys = Object.keys(webhookPayload).sort();
            let toSign = '';
            keys.forEach((key) => {
                if (webhookPayload[key] !== undefined && webhookPayload[key] !== null) {
                    toSign += webhookPayload[key].toString();
                }
            });
            const signature = crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post('/webhooks/flow')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({ ...webhookPayload, s: signature })
                .expect(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Webhook procesado');
        });
        it('3.4 - GET /purchases/my - debe mostrar la compra como pagada', async () => {
            await waitForCondition(async () => {
                const res = await (0, supertest_1.default)(app.getHttpServer())
                    .get('/purchases/my')
                    .set('Authorization', `Bearer ${authToken}`);
                const purchase = res.body.find((p) => p.id === purchaseId);
                return purchase?.status === 'paid';
            });
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/purchases/my')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            const purchase = response.body.find((p) => p.id === purchaseId);
            expect(purchase).toBeDefined();
            expect(purchase.status).toBe('paid');
        });
    });
    describe('=== FASE 4: LUCKY PASSES ===', () => {
        it('4.1 - GET /lucky-passes/my - debe retornar lucky passes generados', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/lucky-passes/my')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            const testPasses = response.body.filter((lp) => lp.raffleId === raffleId);
            expect(testPasses.length).toBeGreaterThan(0);
            testPasses.forEach((pass) => {
                expect(pass).toHaveProperty('id');
                expect(pass).toHaveProperty('ticketNumber');
                expect(pass).toHaveProperty('status');
                expect(pass.status).toBe('active');
            });
        });
        it('4.2 - GET /lucky-passes/my/summary - debe retornar resumen', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get('/lucky-passes/my/summary')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('totalPasses');
            expect(response.body).toHaveProperty('activePasses');
            expect(response.body).toHaveProperty('byRaffle');
            expect(response.body.totalPasses).toBeGreaterThan(0);
        });
    });
    describe('=== FASE 5: SORTEO (DRAW) ===', () => {
        it('5.1 - Preparar rifa para sorteo (cerrarla)', async () => {
            await prisma.raffle.update({
                where: { id: raffleId },
                data: { status: 'closed' },
            });
            const milestone = await prisma.milestone.create({
                data: {
                    raffleId: raffleId,
                    name: 'Meta Test E2E',
                    requiredPacks: 1,
                    sortOrder: 1,
                    isUnlocked: true,
                },
            });
            await prisma.prize.create({
                data: {
                    raffleId: raffleId,
                    milestoneId: milestone.id,
                    type: 'milestone',
                    name: 'Premio Test E2E',
                    description: 'Premio para testing',
                },
            });
            const raffle = await prisma.raffle.findUnique({
                where: { id: raffleId },
            });
            expect(raffle?.status).toBe('closed');
        });
        it('5.2 - POST /admin/raffles/:id/draw - debe ejecutar el sorteo', async () => {
            adminTestEmail = `admin-${Date.now()}@rifalovers.cl`;
            const adminRegisterData = {
                email: adminTestEmail,
                password: 'AdminPass123!',
                firstName: 'Admin',
                lastName: 'Test',
                phone: '56987654321',
            };
            const adminRegResponse = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/register')
                .send(adminRegisterData)
                .expect(201);
            const adminId = adminRegResponse.body.user.id;
            await prisma.user.update({
                where: { id: adminId },
                data: { role: 'admin' },
            });
            const adminLoginResponse = await (0, supertest_1.default)(app.getHttpServer())
                .post('/auth/login')
                .send({
                email: adminRegisterData.email,
                password: adminRegisterData.password,
            })
                .expect(200);
            const adminToken = adminLoginResponse.body.accessToken;
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .post(`/admin/raffles/${raffleId}/draw`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(201);
            expect(response.body).toHaveProperty('raffleId');
            expect(response.body).toHaveProperty('winners');
            expect(response.body).toHaveProperty('drawnAt');
            expect(response.body.raffleId).toBe(raffleId);
            expect(response.body.winners.length).toBeGreaterThan(0);
            response.body.winners.forEach((winner) => {
                expect(winner).toHaveProperty('prizeId');
                expect(winner).toHaveProperty('prizeName');
                expect(winner).toHaveProperty('passNumber');
                expect(winner).toHaveProperty('winnerName');
            });
        });
        it('5.3 - GET /raffles/:id/winners - debe retornar resultados del sorteo', async () => {
            const response = await (0, supertest_1.default)(app.getHttpServer())
                .get(`/raffles/${raffleId}/winners`)
                .expect(200);
            expect(response.body).toHaveProperty('raffleId');
            expect(response.body).toHaveProperty('winners');
            expect(response.body).toHaveProperty('drawnAt');
            expect(response.body.raffleId).toBe(raffleId);
            expect(response.body.winners.length).toBeGreaterThan(0);
        });
    });
});
async function cleanupTestData(prisma) {
    try {
        await prisma.prizeWinner.deleteMany({
            where: {
                prize: {
                    raffle: {
                        title: 'Rifa Test E2E',
                    },
                },
            },
        });
        await prisma.luckyPass.deleteMany({
            where: {
                raffle: {
                    title: 'Rifa Test E2E',
                },
            },
        });
        await prisma.paymentTransaction.deleteMany({
            where: {
                purchase: {
                    raffle: {
                        title: 'Rifa Test E2E',
                    },
                },
            },
        });
        await prisma.userPack.deleteMany({
            where: {
                purchase: {
                    raffle: {
                        title: 'Rifa Test E2E',
                    },
                },
            },
        });
        await prisma.purchase.deleteMany({
            where: {
                raffle: {
                    title: 'Rifa Test E2E',
                },
            },
        });
        await prisma.prize.deleteMany({
            where: {
                raffle: {
                    title: 'Rifa Test E2E',
                },
            },
        });
        await prisma.milestone.deleteMany({
            where: {
                raffle: {
                    title: 'Rifa Test E2E',
                },
            },
        });
        await prisma.raffleProgress.deleteMany({
            where: {
                raffle: {
                    title: 'Rifa Test E2E',
                },
            },
        });
        await prisma.raffle.deleteMany({
            where: { title: 'Rifa Test E2E' },
        });
        await prisma.pack.deleteMany({
            where: { name: 'Pack Test E2E' },
        });
        await prisma.user.deleteMany({
            where: {
                OR: [
                    { email: { contains: 'test-' } },
                    { email: { contains: 'admin-' } },
                ],
            },
        });
    }
    catch (error) {
        console.log('Cleanup error (ignorando):', error.message);
    }
}
//# sourceMappingURL=app.e2e-spec.js.map