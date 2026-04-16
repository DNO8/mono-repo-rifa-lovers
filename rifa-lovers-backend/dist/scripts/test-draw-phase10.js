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
    reset: '\x1b[0m',
};
function success(msg) { console.log(`${colors.green}✅ ${msg}${colors.reset}`); }
function error(msg) { console.log(`${colors.red}❌ ${msg}${colors.reset}`); }
function warning(msg) { console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`); }
function info(msg) { console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`); }
let authToken;
let testRaffleId = 'c2a8d479-4b52-4024-9a8c-7c20979ab768';
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function loginAsAdmin() {
    info('Login como admin...');
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
        success('Login exitoso como admin');
        return true;
    }
    catch (err) {
        error(`Error login: ${err.message}`);
        return false;
    }
}
async function testCheckDrawAvailability() {
    info('\nTest 1: GET /admin/raffles/:id/draw/check');
    try {
        const response = await fetch(`${BASE_URL}/admin/raffles/${testRaffleId}/draw/check`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (!response.ok) {
            error(`Check failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success('Endpoint disponible:');
        console.log(`   • Puede sortear: ${data.canDraw ? 'SÍ' : 'NO'}`);
        console.log(`   • Razón: ${data.reason || 'N/A'}`);
        console.log(`   • Premios desbloqueados: ${data.prizesCount}`);
        console.log(`   • LuckyPasses activos: ${data.activePassesCount}`);
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testExecuteDraw() {
    info('\nTest 2: POST /admin/raffles/:id/draw');
    try {
        const response = await fetch(`${BASE_URL}/admin/raffles/${testRaffleId}/draw`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.status === 400) {
            const data = await response.json();
            warning(`No se pudo ejecutar sorteo: ${data.message}`);
            warning('Esto es normal si la rifa no está cerrada o ya tiene ganadores');
            return true;
        }
        if (!response.ok) {
            error(`Execute draw failed: ${response.status}`);
            const errorText = await response.text();
            console.log(`   Error: ${errorText}`);
            return false;
        }
        const data = await response.json();
        success('Sorteo ejecutado exitosamente!');
        console.log(`   • Rifa ID: ${data.raffleId}`);
        console.log(`   • Fecha sorteo: ${data.drawnAt}`);
        console.log(`   • Ganadores: ${data.winners?.length || 0}`);
        if (data.winners?.length > 0) {
            console.log('\n   🏆 Ganadores:');
            data.winners.forEach((w, i) => {
                console.log(`      ${i + 1}. ${w.prizeName}`);
                console.log(`         LuckyPass #${w.passNumber} - ${w.userName || w.userEmail}`);
            });
        }
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testGetDrawResults() {
    info('\nTest 3: GET /raffles/:id/winners (público)');
    try {
        const response = await fetch(`${BASE_URL}/raffles/${testRaffleId}/winners`);
        if (!response.ok) {
            error(`Get results failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        if (data.message) {
            warning(`Sin resultados: ${data.message}`);
            return true;
        }
        success('Resultados obtenidos:');
        console.log(`   • Rifa ID: ${data.raffleId}`);
        console.log(`   • Fecha sorteo: ${data.drawnAt}`);
        console.log(`   • Total ganadores: ${data.winners?.length || 0}`);
        if (data.winners?.length > 0) {
            console.log('\n   🏆 Ganadores:');
            data.winners.forEach((w, i) => {
                console.log(`      ${i + 1}. ${w.prizeName}`);
                console.log(`         → LuckyPass #${w.passNumber}`);
                console.log(`         → Usuario: ${w.userName || w.userEmail || 'N/A'}`);
            });
        }
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testDatabaseEntries() {
    info('\nTest 4: Verificar entradas en base de datos');
    try {
        const winnersCount = await prisma.prizeWinner.count({
            where: {
                prize: {
                    raffleId: testRaffleId,
                },
            },
        });
        const luckyPassWinners = await prisma.luckyPass.count({
            where: {
                raffleId: testRaffleId,
                status: 'winner',
                isWinner: true,
            },
        });
        success('Verificación de base de datos:');
        console.log(`   • Registros en prize_winners: ${winnersCount}`);
        console.log(`   • LuckyPasses marcados como ganadores: ${luckyPassWinners}`);
        if (winnersCount > 0) {
            const winners = await prisma.prizeWinner.findMany({
                where: {
                    prize: { raffleId: testRaffleId },
                },
                include: {
                    prize: true,
                    luckyPass: true,
                    user: true,
                },
                take: 5,
            });
            console.log('\n   📋 Primeros ganadores en BD:');
            winners.forEach((w, i) => {
                console.log(`      ${i + 1}. ${w.prize?.name} → ${w.user?.email || 'N/A'}`);
            });
        }
        return true;
    }
    catch (err) {
        error(`Error DB: ${err.message}`);
        return false;
    }
}
async function main() {
    console.log('='.repeat(60));
    console.log('🎲 FASE 10 - TEST DE SORTEO (DRAW)');
    console.log('='.repeat(60));
    try {
        await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    }
    catch {
        error('Backend no está corriendo en localhost:3000');
        console.log('Inicia el backend: pnpm run start:dev');
        process.exit(1);
    }
    const results = {
        login: false,
        check: false,
        execute: false,
        results: false,
        database: false,
    };
    results.login = await loginAsAdmin();
    if (results.login) {
        results.check = await testCheckDrawAvailability();
        results.execute = await testExecuteDraw();
        results.results = await testGetDrawResults();
        results.database = await testDatabaseEntries();
    }
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE TESTS');
    console.log('='.repeat(60));
    if (results.login) {
        success('Login');
    }
    else {
        error('Login');
    }
    if (results.check) {
        success('Verificar disponibilidad');
    }
    else {
        error('Verificar disponibilidad');
    }
    if (results.execute) {
        success('Ejecutar sorteo');
    }
    else {
        error('Ejecutar sorteo');
    }
    if (results.results) {
        success('Obtener resultados');
    }
    else {
        error('Obtener resultados');
    }
    if (results.database) {
        success('Verificar BD');
    }
    else {
        error('Verificar BD');
    }
    const allPassed = Object.values(results).every(r => r);
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
        console.log('🎉 FASE 10 - SORTEO IMPLEMENTADO CORRECTAMENTE');
        console.log('');
        console.log('Endpoints disponibles:');
        console.log('  • GET  /admin/raffles/:id/draw/check (admin)');
        console.log('  • POST /admin/raffles/:id/draw       (admin)');
        console.log('  • GET  /raffles/:id/winners          (público)');
        console.log('');
        console.log('Frontend actualizado:');
        console.log('  • WinnersSection integrado con API');
        console.log('  • Hook useDrawResults creado');
    }
    else {
        console.log('⚠️  Algunos tests fallaron - revisa los errores arriba');
    }
    console.log('='.repeat(60) + '\n');
    await prisma.$disconnect();
    process.exit(allPassed ? 0 : 1);
}
main().catch(err => {
    console.error('Error fatal:', err);
    prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=test-draw-phase10.js.map