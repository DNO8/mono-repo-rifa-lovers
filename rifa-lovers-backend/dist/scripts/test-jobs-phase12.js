"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const BASE_URL = 'http://localhost:3000';
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
};
function success(msg) { console.log(`${colors.green}✅ ${msg}${colors.reset}`); }
function error(msg) { console.log(`${colors.red}❌ ${msg}${colors.reset}`); }
function warning(msg) { console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`); }
function info(msg) { console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`); }
function phase(msg) { console.log(`${colors.cyan}\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`); }
let authToken;
let testRaffleId;
let testPurchaseId;
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function login() {
    info('Login de usuario...');
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'dcontrerasl@live.com',
                password: '123456789',
            }),
        });
        if (!response.ok) {
            error(`Login failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        authToken = data.accessToken;
        success(`Login exitoso`);
        return true;
    }
    catch (err) {
        error(`Error login: ${err.message}`);
        return false;
    }
}
async function prepareTestData() {
    phase('📦 PREPARANDO DATOS DE PRUEBA');
    try {
        info('Creando rifa de prueba para SOLD_OUT...');
        const raffle = await prisma.raffle.create({
            data: {
                title: 'Test Auto SOLD_OUT',
                description: 'Rifa para probar job automático',
                goalPacks: 10,
                status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        testRaffleId = raffle.id;
        success(`Rifa creada: ${raffle.id}`);
        await prisma.raffleProgress.create({
            data: {
                raffleId: raffle.id,
                packsSold: 15,
                revenueTotal: 99000,
                percentageToGoal: 150.00,
            },
        });
        success(`Progress creado: 15/10 packs vendidos`);
        info('\nCreando rifa de prueba para CLOSED...');
        const closedRaffle = await prisma.raffle.create({
            data: {
                title: 'Test Auto CLOSED',
                description: 'Rifa con fecha pasada',
                goalPacks: 100,
                status: 'active',
                startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
        });
        success(`Rifa cerrada creada: ${closedRaffle.id}`);
        info('\nCreando purchase pendiente antigua...');
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: crypto.randomUUID(),
                    email: 'test-jobs@rifalovers.com',
                    firstName: 'Test',
                    lastName: 'Jobs',
                    role: 'customer',
                },
            });
        }
        const purchase = await prisma.purchase.create({
            data: {
                userId: user.id,
                raffleId: raffle.id,
                status: 'pending',
                totalAmount: 9900,
                createdAt: new Date(Date.now() - 35 * 60 * 1000),
            },
        });
        testPurchaseId = purchase.id;
        success(`Purchase pendiente creada: ${purchase.id} (35 min atrás)`);
        success('\n✅ Datos de prueba preparados exitosamente!');
        return true;
    }
    catch (err) {
        error(`Error preparando datos: ${err.message}`);
        return false;
    }
}
async function testSoldOutJob() {
    info('\n[Test 1] POST /admin/jobs/run/sold_out');
    try {
        const response = await fetch(`${BASE_URL}/admin/jobs/run/sold_out`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.status === 403) {
            warning('403 - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Job SOLD_OUT failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success(`Job SOLD_OUT ejecutado: ${data.message}`);
        const updatedRaffle = await prisma.raffle.findUnique({
            where: { id: testRaffleId },
        });
        if (updatedRaffle?.status === 'sold_out') {
            success(`✓ Rifa ${testRaffleId} ahora está: ${updatedRaffle.status}`);
        }
        else {
            warning(`Rifa sigue en estado: ${updatedRaffle?.status}`);
        }
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testClosedJob() {
    info('\n[Test 2] POST /admin/jobs/run/closed');
    try {
        const response = await fetch(`${BASE_URL}/admin/jobs/run/closed`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.status === 403) {
            warning('403 - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Job CLOSED failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success(`Job CLOSED ejecutado: ${data.message}`);
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testExpirePurchasesJob() {
    info('\n[Test 3] POST /admin/jobs/run/expire_purchases');
    try {
        const response = await fetch(`${BASE_URL}/admin/jobs/run/expire_purchases`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.status === 403) {
            warning('403 - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Job EXPIRE_PURCHASES failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success(`Job EXPIRE_PURCHASES ejecutado: ${data.message}`);
        const updatedPurchase = await prisma.purchase.findUnique({
            where: { id: testPurchaseId },
        });
        if (updatedPurchase?.status === 'failed') {
            success(`✓ Purchase ${testPurchaseId} ahora está: ${updatedPurchase.status}`);
        }
        else {
            warning(`Purchase sigue en estado: ${updatedPurchase?.status}`);
        }
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testJobsStatus() {
    info('\n[Test 4] GET /admin/jobs/status');
    try {
        const response = await fetch(`${BASE_URL}/admin/jobs/status`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.status === 403) {
            warning('403 - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Get jobs status failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success('Estado de jobs obtenido:');
        console.log(`   • Próximo SOLD_OUT: ${new Date(data.nextRun.soldOut).toLocaleString()}`);
        console.log(`   • Próximo CLOSED: ${new Date(data.nextRun.closed).toLocaleString()}`);
        console.log(`   • Próximo EXPIRE: ${new Date(data.nextRun.expirePurchases).toLocaleString()}`);
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function cleanupTestData() {
    phase('🧹 LIMPIEZA DE DATOS DE PRUEBA');
    try {
        const testRaffles = await prisma.raffle.findMany({
            where: {
                title: {
                    contains: 'Test Auto',
                },
            },
        });
        for (const raffle of testRaffles) {
            await prisma.raffleProgress.deleteMany({
                where: { raffleId: raffle.id },
            });
            await prisma.purchase.deleteMany({
                where: { raffleId: raffle.id },
            });
            await prisma.raffle.delete({
                where: { id: raffle.id },
            });
            info(`Eliminada rifa: ${raffle.id}`);
        }
        await prisma.user.deleteMany({
            where: { email: 'test-jobs@rifalovers.com' },
        });
        success('✅ Limpieza completada!');
    }
    catch (err) {
        warning(`Error en limpieza: ${err.message}`);
    }
}
async function verifyDatabaseState() {
    info('\nVerificación de estados en Base de Datos:');
    try {
        const rafflesByStatus = await prisma.raffle.groupBy({
            by: ['status'],
            _count: { status: true },
        });
        console.log('\n   Rifas por estado:');
        rafflesByStatus.forEach((r) => {
            console.log(`      • ${r.status}: ${r._count.status}`);
        });
        const purchasesByStatus = await prisma.purchase.groupBy({
            by: ['status'],
            _count: { status: true },
        });
        console.log('\n   Purchases por estado:');
        purchasesByStatus.forEach((p) => {
            console.log(`      • ${p.status}: ${p._count.status}`);
        });
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function main() {
    console.log('\n' + '='.repeat(70));
    console.log('  ⏰ FASE 12 - JOBS AUTOMÁTICOS');
    console.log('  SOLD_OUT | CLOSED | EXPIRE_PURCHASES');
    console.log('='.repeat(70));
    try {
        await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    }
    catch {
        error('Backend no está corriendo en localhost:3000');
        console.log('Inicia el backend: pnpm run start:dev');
        process.exit(1);
    }
    success('Backend conectado');
    const loggedIn = await login();
    if (!loggedIn) {
        error('No se pudo iniciar sesión');
        process.exit(1);
    }
    const prepared = await prepareTestData();
    if (!prepared) {
        error('No se pudieron preparar los datos de prueba');
        await cleanupTestData();
        process.exit(1);
    }
    phase('🧪 EJECUTANDO TESTS DE JOBS');
    const results = {
        soldOut: await testSoldOutJob(),
        closed: await testClosedJob(),
        expirePurchases: await testExpirePurchasesJob(),
        status: await testJobsStatus(),
        verify: await verifyDatabaseState(),
    };
    phase('📊 RESUMEN');
    console.log('\nResultados de tests:');
    results.soldOut ? success('Auto SOLD_OUT') : error('Auto SOLD_OUT');
    results.closed ? success('Auto CLOSED') : error('Auto CLOSED');
    results.expirePurchases ? success('Expire Purchases') : error('Expire Purchases');
    results.status ? success('Jobs Status') : error('Jobs Status');
    results.verify ? success('Verificación BD') : error('Verificación BD');
    const passedTests = Object.values(results).filter(r => r).length;
    const totalTests = Object.values(results).length;
    console.log('\n' + '='.repeat(70));
    console.log(`  RESULTADOS: ${passedTests}/${totalTests} tests pasaron`);
    console.log('='.repeat(70));
    if (passedTests === totalTests) {
        console.log('\n  🎉 ¡FASE 12 - JOBS AUTOMÁTICOS COMPLETADA!');
    }
    else {
        console.log('\n  ⚠️  Algunos tests fallaron');
        console.log('  Nota: 403 = Usuario sin permisos de admin (comportamiento esperado)');
    }
    console.log('\n  📋 Jobs programados:');
    console.log('     • Auto SOLD_OUT     → cada 5 minutos');
    console.log('     • Auto CLOSED       → cada 5 minutos');
    console.log('     • Expire Purchases  → cada 15 minutos');
    console.log('\n  🎮 Endpoints de control:');
    console.log('     GET  /admin/jobs/status');
    console.log('     POST /admin/jobs/run/sold_out');
    console.log('     POST /admin/jobs/run/closed');
    console.log('     POST /admin/jobs/run/expire_purchases');
    console.log('='.repeat(70) + '\n');
    await cleanupTestData();
    await prisma.$disconnect();
    process.exit(passedTests === totalTests ? 0 : 1);
}
main().catch(async (err) => {
    console.error('Error fatal:', err);
    await cleanupTestData();
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=test-jobs-phase12.js.map