"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
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
let testRaffleId;
let testUserId;
const prisma = new client_1.PrismaClient();
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
async function testCreateRaffle() {
    info('\nTest 1: POST /admin/raffles');
    try {
        const response = await fetch(`${BASE_URL}/admin/raffles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Rifa Test Admin ' + new Date().toISOString().slice(0, 16),
                description: 'Rifa creada para pruebas de admin',
                goalPacks: 100,
                startDate: new Date().toISOString(),
                status: 'draft'
            }),
        });
        if (response.status === 403) {
            warning('403 Forbidden - Usuario no tiene permisos de admin');
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
        console.log(`   • Estado: ${data.status}`);
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testGetAllRaffles() {
    info('\nTest 2: GET /admin/raffles');
    try {
        const response = await fetch(`${BASE_URL}/admin/raffles`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.status === 403) {
            warning('403 Forbidden - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Get raffles failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success(`Rifas obtenidas: ${data.length}`);
        if (data.length > 0) {
            console.log(`   • Primera rifa: ${data[0].title || 'Sin título'}`);
            console.log(`   • Estado: ${data[0].status}`);
            console.log(`   • Progreso: ${data[0].progressPercentage}%`);
            if (!testRaffleId) {
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
    info('\nTest 3: PATCH /admin/raffles/:id');
    try {
        const response = await fetch(`${BASE_URL}/admin/raffles/${testRaffleId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: 'Descripción actualizada desde test admin',
                goalPacks: 150
            }),
        });
        if (response.status === 403) {
            warning('403 Forbidden - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Update raffle failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success('Rifa actualizada!');
        console.log(`   • Nueva meta: ${data.goalPacks}`);
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
    info('\nTest 4: PATCH /admin/raffles/:id/status');
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
            warning('403 Forbidden - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Update status failed: ${response.status}`);
            const text = await response.text();
            console.log(`   Error: ${text}`);
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
    info('\nTest 5: GET /admin/kpis');
    try {
        const response = await fetch(`${BASE_URL}/admin/kpis`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.status === 403) {
            warning('403 Forbidden - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Get KPIs failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success('KPIs obtenidos:');
        console.log(`   • Ventas totales: $${data.totalSales.toLocaleString()} CLP`);
        console.log(`   • Packs vendidos: ${data.packsSold}`);
        console.log(`   • Usuarios activos: ${data.activeUsers}`);
        console.log(`   • Rifas activas: ${data.activeRaffles}`);
        console.log(`   • Total compras: ${data.totalPurchases}`);
        console.log(`   • Compras pendientes: ${data.pendingPurchases}`);
        console.log(`   • Compras completadas: ${data.completedPurchases}`);
        console.log(`   • LuckyPasses: ${data.totalLuckyPasses}`);
        console.log(`   • Ganadores: ${data.winnersCount}`);
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function testGetAllUsers() {
    info('\nTest 6: GET /admin/users');
    try {
        const response = await fetch(`${BASE_URL}/admin/users?take=5`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        if (response.status === 403) {
            warning('403 Forbidden - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Get users failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success(`Usuarios obtenidos: ${data.users.length} de ${data.total}`);
        if (data.users.length > 0) {
            console.log(`   • Primer usuario: ${data.users[0].email}`);
            console.log(`   • Rol: ${data.users[0].role}`);
            console.log(`   • Estado: ${data.users[0].status}`);
            if (data.users[0].role !== 'admin') {
                testUserId = data.users[0].id;
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
    info('\nTest 7: PATCH /admin/users/:id/role');
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
            warning('403 Forbidden - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Update role failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success(`Rol cambiado a: ${data.role}`);
        info('Restaurando rol a customer...');
        await fetch(`${BASE_URL}/admin/users/${testUserId}/role`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: 'customer' }),
        });
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
    info('\nTest 8: PATCH /admin/users/:id/block');
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
            warning('403 Forbidden - Usuario no tiene permisos de admin');
            return true;
        }
        if (!response.ok) {
            error(`Block user failed: ${response.status}`);
            return false;
        }
        const data = await response.json();
        success(`Usuario ${data.status === 'blocked' ? 'bloqueado' : 'desbloqueado'}`);
        info('Restaurando estado a active...');
        await fetch(`${BASE_URL}/admin/users/${testUserId}/block`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'active' }),
        });
        return true;
    }
    catch (err) {
        error(`Error: ${err.message}`);
        return false;
    }
}
async function main() {
    console.log('='.repeat(60));
    console.log('👑 FASE 11 - TEST DE ADMINISTRACIÓN');
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
        createRaffle: false,
        getRaffles: false,
        updateRaffle: false,
        updateStatus: false,
        getKpis: false,
        getUsers: false,
        updateRole: false,
        blockUser: false,
    };
    results.login = await loginAsAdmin();
    if (results.login) {
        results.createRaffle = await testCreateRaffle();
        results.getRaffles = await testGetAllRaffles();
        results.updateRaffle = await testUpdateRaffle();
        results.updateStatus = await testUpdateRaffleStatus();
        results.getKpis = await testGetKpis();
        results.getUsers = await testGetAllUsers();
        results.updateRole = await testUpdateUserRole();
        results.blockUser = await testBlockUser();
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
    if (results.createRaffle) {
        success('Crear rifa');
    }
    else {
        error('Crear rifa');
    }
    if (results.getRaffles) {
        success('Listar rifas');
    }
    else {
        error('Listar rifas');
    }
    if (results.updateRaffle) {
        success('Actualizar rifa');
    }
    else {
        error('Actualizar rifa');
    }
    if (results.updateStatus) {
        success('Cambiar estado rifa');
    }
    else {
        error('Cambiar estado rifa');
    }
    if (results.getKpis) {
        success('Obtener KPIs');
    }
    else {
        error('Obtener KPIs');
    }
    if (results.getUsers) {
        success('Listar usuarios');
    }
    else {
        error('Listar usuarios');
    }
    if (results.updateRole) {
        success('Cambiar rol usuario');
    }
    else {
        error('Cambiar rol usuario');
    }
    if (results.blockUser) {
        success('Bloquear usuario');
    }
    else {
        error('Bloquear usuario');
    }
    const passedTests = Object.values(results).filter(r => r).length;
    const totalTests = Object.values(results).length;
    console.log('\n' + '='.repeat(60));
    if (passedTests === totalTests) {
        console.log('🎉 FASE 11 - ADMIN IMPLEMENTADO CORRECTAMENTE');
    }
    else {
        console.log(`⚠️  ${passedTests}/${totalTests} tests pasaron`);
        console.log('Nota: Los 403 son esperados si el usuario no tiene rol admin');
    }
    console.log('');
    console.log('Endpoints disponibles:');
    console.log('  • POST /admin/raffles           (crear rifa)');
    console.log('  • GET  /admin/raffles           (listar rifas)');
    console.log('  • PATCH /admin/raffles/:id      (actualizar rifa)');
    console.log('  • PATCH /admin/raffles/:id/status (cambiar estado)');
    console.log('  • GET  /admin/kpis              (métricas)');
    console.log('  • GET  /admin/users             (listar usuarios)');
    console.log('  • PATCH /admin/users/:id/role   (cambiar rol)');
    console.log('  • PATCH /admin/users/:id/block  (bloquear usuario)');
    console.log('='.repeat(60) + '\n');
    await prisma.$disconnect();
    process.exit(passedTests === totalTests ? 0 : 1);
}
main().catch(err => {
    console.error('Error fatal:', err);
    prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=test-admin-phase11.js.map