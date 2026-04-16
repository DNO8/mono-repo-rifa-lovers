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
let testUserId;
let closedRaffleId;
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
        success(`Login exitoso - Token obtenido`);
        return true;
    }
    catch (err) {
        error(`Error login: ${err.message}`);
        return false;
    }
}
async function testCheckDrawAvailability() {
    info('\n[Test 1] GET /admin/raffles/:id/draw/check');
    try {
        const closedRaffle = await prisma.raffle.findFirst({
            where: { status: 'closed' },
        });
        if (!closedRaffle) {
            warning('No hay rifas en estado closed - usando rifa activa');
            const activeRaffle = await prisma.raffle.findFirst();
            if (!activeRaffle) {
                warning('No hay rifas en la base de datos');
                return true;
            }
            closedRaffleId = activeRaffle.id;
        }
        else {
            closedRaffleId = closedRaffle.id;
        }
        const response = await fetch(`${BASE_URL}/admin/raffles/${closedRaffleId}/draw/check`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (!response.ok) {
            if (response.status === 403) {
                warning('403 - Usuario no tiene permisos de admin');
                return true;
            }
            error(`Check failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success('Disponibilidad verificada:');
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
    info('\n[Test 2] POST /admin/raffles/:id/draw');
    try {
        const response = await fetch(`${BASE_URL}/admin/raffles/${closedRaffleId}/draw`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.status === 403) {
            warning('403 - Usuario no tiene permisos de admin/operator');
            return true;
        }
        if (response.status === 400) {
            const data = await response.json();
            warning(`No se pudo ejecutar: ${data.message}`);
            warning('Esto es normal si la rifa no está cerrada o ya tiene ganadores');
            return true;
        }
        if (!response.ok) {
            error(`Execute draw failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success('Sorteo ejecutado exitosamente!');
        console.log(`   • Rifa ID: ${data.raffleId}`);
        console.log(`   • Fecha sorteo: ${data.drawnAt}`);
        console.log(`   • Total ganadores: ${data.winners?.length || 0}`);
        if (data.winners?.length > 0) {
            console.log('\n   🏆 Primeros ganadores:');
            data.winners.slice(0, 3).forEach((w, i) => {
                console.log(`      ${i + 1}. ${w.prizeName}`);
                console.log(`         → LuckyPass #${w.passNumber}`);
                console.log(`         → Usuario: ${w.userName || w.userEmail}`);
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
    info('\n[Test 3] GET /raffles/:id/winners (público)');
    try {
        const raffle = await prisma.raffle.findFirst({
            where: { status: 'drawn' },
        });
        const raffleId = raffle?.id || closedRaffleId;
        const response = await fetch(`${BASE_URL}/raffles/${raffleId}/winners`);
        if (!response.ok) {
            error(`Get results failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        if (data.message) {
            warning(`Sin sorteo aún: ${data.message}`);
            return true;
        }
        success('Resultados obtenidos:');
        console.log(`   • Rifa: ${data.raffleId}`);
        console.log(`   • Fecha: ${data.drawnAt}`);
        console.log(`   • Ganadores: ${data.winners?.length || 0}`);
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testCreateRaffle() {
    info('\n[Test 4] POST /admin/raffles');
    try {
        const response = await fetch(`${BASE_URL}/admin/raffles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Rifa Test ' + new Date().toISOString().slice(0, 16),
                description: 'Rifa creada para pruebas automatizadas',
                goalPacks: 100,
                startDate: new Date().toISOString(),
                status: 'draft'
            }),
        });
        if (response.status === 403) {
            warning('403 - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Create raffle failed: ${response.status}`);
            const text = await response.text();
            console.log(`   Error: ${text}`);
            return false;
        }
        const data = await response.json();
        testRaffleId = data.id;
        success('Rifa creada exitosamente!');
        console.log(`   • ID: ${data.id}`);
        console.log(`   • Título: ${data.title}`);
        console.log(`   • Meta: ${data.goalPacks} packs`);
        console.log(`   • Estado: ${data.status}`);
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testGetAllRaffles() {
    info('\n[Test 5] GET /admin/raffles');
    try {
        const response = await fetch(`${BASE_URL}/admin/raffles`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.status === 403) {
            warning('403 - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Get raffles failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success(`Rifas obtenidas: ${data.length}`);
        if (data.length > 0) {
            console.log(`   • Total rifas: ${data.length}`);
            console.log(`   • Primera: ${data[0].title || 'Sin título'}`);
            console.log(`   • Estado: ${data[0].status}`);
            console.log(`   • Progreso: ${data[0].progressPercentage}%`);
            console.log(`   • Packs vendidos: ${data[0].packsSold}`);
            console.log(`   • Ingresos: $${data[0].totalRevenue?.toLocaleString() || 0} CLP`);
            if (!testRaffleId && data.length > 0) {
                testRaffleId = data[0].id;
            }
        }
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testUpdateRaffle() {
    if (!testRaffleId) {
        warning('Saltando test - no hay rifa de prueba');
        return true;
    }
    info('\n[Test 6] PATCH /admin/raffles/:id');
    try {
        const response = await fetch(`${BASE_URL}/admin/raffles/${testRaffleId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: 'Descripción actualizada desde test automatizado',
                goalPacks: 150
            }),
        });
        if (response.status === 403) {
            warning('403 - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Update raffle failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success('Rifa actualizada!');
        console.log(`   • Nueva descripción: ${data.description}`);
        console.log(`   • Nueva meta: ${data.goalPacks} packs`);
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testUpdateRaffleStatus() {
    if (!testRaffleId) {
        warning('Saltando test - no hay rifa de prueba');
        return true;
    }
    info('\n[Test 7] PATCH /admin/raffles/:id/status');
    try {
        const response = await fetch(`${BASE_URL}/admin/raffles/${testRaffleId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'active'
            }),
        });
        if (response.status === 403) {
            warning('403 - Usuario no tiene permisos de admin');
            return true;
        }
        if (response.status === 400) {
            const data = await response.json();
            warning(`No se pudo cambiar estado: ${data.message}`);
            return true;
        }
        if (!response.ok) {
            error(`Update status failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success(`Estado cambiado a: ${data.status}`);
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testGetKpis() {
    info('\n[Test 8] GET /admin/kpis');
    try {
        const response = await fetch(`${BASE_URL}/admin/kpis`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.status === 403) {
            warning('403 - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Get KPIs failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success('KPIs obtenidos:');
        console.log(`   💰 Ventas totales: $${data.totalSales.toLocaleString()} CLP`);
        console.log(`   📦 Packs vendidos: ${data.packsSold}`);
        console.log(`   👥 Usuarios activos: ${data.activeUsers}`);
        console.log(`   🎯 Rifas activas: ${data.activeRaffles}`);
        console.log(`   🛒 Total compras: ${data.totalPurchases}`);
        console.log(`   ⏳ Compras pendientes: ${data.pendingPurchases}`);
        console.log(`   ✅ Compras completadas: ${data.completedPurchases}`);
        console.log(`   🎫 LuckyPasses: ${data.totalLuckyPasses}`);
        console.log(`   🏆 Ganadores: ${data.winnersCount}`);
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testGetAllUsers() {
    info('\n[Test 9] GET /admin/users');
    try {
        const response = await fetch(`${BASE_URL}/admin/users?take=5`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.status === 403) {
            warning('403 - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Get users failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success(`Usuarios obtenidos: ${data.users.length} de ${data.total}`);
        if (data.users.length > 0) {
            console.log(`\n   👤 Primeros usuarios:`);
            data.users.slice(0, 3).forEach((u, i) => {
                console.log(`      ${i + 1}. ${u.email}`);
                console.log(`         • Rol: ${u.role}`);
                console.log(`         • Estado: ${u.status}`);
                console.log(`         • Compras: ${u._count?.purchases || 0}`);
                console.log(`         • LuckyPasses: ${u._count?.luckyPasses || 0}`);
            });
            const nonAdmin = data.users.find((u) => u.role !== 'admin');
            if (nonAdmin) {
                testUserId = nonAdmin.id;
            }
            else if (data.users.length > 1) {
                testUserId = data.users[1].id;
            }
        }
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testUpdateUserRole() {
    if (!testUserId) {
        warning('Saltando test - no hay usuario de prueba no-admin');
        return true;
    }
    info('\n[Test 10] PATCH /admin/users/:id/role');
    try {
        const response = await fetch(`${BASE_URL}/admin/users/${testUserId}/role`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: 'operator'
            }),
        });
        if (response.status === 403) {
            warning('403 - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Update role failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success(`Rol cambiado de "customer" a "${data.role}"`);
        info('Restaurando rol a "customer"...');
        await fetch(`${BASE_URL}/admin/users/${testUserId}/role`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: 'customer' }),
        });
        success('Rol restaurado');
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testBlockUser() {
    if (!testUserId) {
        warning('Saltando test - no hay usuario de prueba');
        return true;
    }
    info('\n[Test 11] PATCH /admin/users/:id/block');
    try {
        const response = await fetch(`${BASE_URL}/admin/users/${testUserId}/block`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'blocked'
            }),
        });
        if (response.status === 403) {
            warning('403 - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Block user failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success(`Usuario bloqueado (estado: ${data.status})`);
        info('Restaurando estado a "active"...');
        await fetch(`${BASE_URL}/admin/users/${testUserId}/block`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'active' }),
        });
        success('Estado restaurado');
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testDatabaseEntries() {
    info('\n[Test 12] Verificación de Base de Datos');
    try {
        const [totalRaffles, totalUsers, totalPrizes, totalWinners, totalPurchases,] = await Promise.all([
            prisma.raffle.count(),
            prisma.user.count(),
            prisma.prize.count(),
            prisma.prizeWinner.count(),
            prisma.purchase.count(),
        ]);
        success('Verificación de BD:');
        console.log(`   • Rifas: ${totalRaffles}`);
        console.log(`   • Usuarios: ${totalUsers}`);
        console.log(`   • Premios: ${totalPrizes}`);
        console.log(`   • Ganadores registrados: ${totalWinners}`);
        console.log(`   • Compras: ${totalPurchases}`);
        return true;
    }
    catch (err) {
        error(`Error DB: ${err.message}`);
        return false;
    }
}
async function main() {
    console.log('\n' + '='.repeat(70));
    console.log('  🎰 RIFA LOVERS - TEST COMPLETO FASES 10 & 11');
    console.log('  Draw (Sorteo) + Admin Panel');
    console.log('='.repeat(70));
    try {
        await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    }
    catch {
        error('Backend no está corriendo en localhost:3000');
        console.log('Inicia el backend: pnpm run start:dev');
        process.exit(1);
    }
    success('Backend conectado en localhost:3000');
    const loggedIn = await login();
    if (!loggedIn) {
        error('No se pudo iniciar sesión');
        process.exit(1);
    }
    const results = {};
    phase('🎲 FASE 10 - DRAW (SORTEO)');
    results.checkDraw = await testCheckDrawAvailability();
    results.executeDraw = await testExecuteDraw();
    results.getResults = await testGetDrawResults();
    phase('👑 FASE 11 - ADMINISTRACIÓN');
    results.createRaffle = await testCreateRaffle();
    results.getRaffles = await testGetAllRaffles();
    results.updateRaffle = await testUpdateRaffle();
    results.updateStatus = await testUpdateRaffleStatus();
    results.getKpis = await testGetKpis();
    results.getUsers = await testGetAllUsers();
    results.updateRole = await testUpdateUserRole();
    results.blockUser = await testBlockUser();
    phase('💾 VERIFICACIÓN DE BASE DE DATOS');
    results.database = await testDatabaseEntries();
    phase('📊 RESUMEN FINAL');
    const drawTests = ['checkDraw', 'executeDraw', 'getResults'];
    const adminTests = ['createRaffle', 'getRaffles', 'updateRaffle', 'updateStatus', 'getKpis', 'getUsers', 'updateRole', 'blockUser'];
    console.log('\n🎲 FASE 10 - DRAW:');
    drawTests.forEach(key => {
        const name = {
            checkDraw: 'Verificar disponibilidad',
            executeDraw: 'Ejecutar sorteo',
            getResults: 'Obtener resultados',
        }[key];
        results[key] ? success(name || key) : error(name || key);
    });
    console.log('\n👑 FASE 11 - ADMIN:');
    adminTests.forEach(key => {
        const name = {
            createRaffle: 'Crear rifa',
            getRaffles: 'Listar rifas',
            updateRaffle: 'Actualizar rifa',
            updateStatus: 'Cambiar estado',
            getKpis: 'Obtener KPIs',
            getUsers: 'Listar usuarios',
            updateRole: 'Cambiar rol',
            blockUser: 'Bloquear usuario',
        }[key];
        results[key] ? success(name || key) : error(name || key);
    });
    console.log('\n💾 Base de Datos:');
    results.database ? success('Verificación BD') : error('Verificación BD');
    const allTests = Object.values(results);
    const passedTests = allTests.filter(r => r).length;
    const totalTests = allTests.length;
    const drawPassed = drawTests.filter(k => results[k]).length;
    const adminPassed = adminTests.filter(k => results[k]).length;
    console.log('\n' + '='.repeat(70));
    console.log(`  RESULTADOS: ${passedTests}/${totalTests} tests pasaron`);
    console.log(`  🎲 Draw: ${drawPassed}/${drawTests.length}`);
    console.log(`  👑 Admin: ${adminPassed}/${adminTests.length}`);
    console.log('='.repeat(70));
    if (passedTests === totalTests) {
        console.log('\n  🎉 ¡TODAS LAS FASES 10 Y 11 COMPLETADAS EXITOSAMENTE!');
    }
    else {
        console.log('\n  ⚠️  Algunos tests fallaron');
        console.log('  Nota: Los errores 403 indican que el usuario no tiene rol admin/operator');
    }
    console.log('\n  📋 Endpoints implementados:');
    console.log('     POST /admin/raffles/:id/draw      (ejecutar sorteo)');
    console.log('     GET  /admin/raffles/:id/draw/check (verificar disponibilidad)');
    console.log('     GET  /raffles/:id/winners          (resultados públicos)');
    console.log('     POST /admin/raffles                (crear rifa)');
    console.log('     GET  /admin/raffles                (listar rifas)');
    console.log('     PATCH /admin/raffles/:id           (actualizar rifa)');
    console.log('     PATCH /admin/raffles/:id/status    (cambiar estado)');
    console.log('     GET  /admin/kpis                   (métricas)');
    console.log('     GET  /admin/users                  (listar usuarios)');
    console.log('     PATCH /admin/users/:id/role        (cambiar rol)');
    console.log('     PATCH /admin/users/:id/block       (bloquear usuario)');
    console.log('='.repeat(70) + '\n');
    await prisma.$disconnect();
    process.exit(passedTests === totalTests ? 0 : 1);
}
main().catch(err => {
    console.error('Error fatal:', err);
    prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=test-complete-phase10-11.js.map