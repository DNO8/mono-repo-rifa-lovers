"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const BASE_URL = 'http://localhost:3000';
const TEST_CREDENTIALS = {
    email: 'dcontrerasl@live.com',
    password: '123456789',
};
const TEST_DATA = {
    raffleId: 'c2a8d479-4b52-4024-9a8c-7c20979ab768',
    packId: 'eb473bad-83c1-42b5-a13d-9f803a6b7ea3',
    quantity: 2,
    selectedNumber: 1234,
};
async function login() {
    console.log('🔐 Paso 1: Login...');
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_CREDENTIALS),
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Login failed: ${response.status} - ${error}`);
    }
    const data = await response.json();
    console.log('✅ Login exitoso');
    console.log(`   Token: ${data.accessToken?.substring(0, 30)}...`);
    return data.accessToken;
}
async function createPurchase(token) {
    console.log('\n🛒 Paso 2: Crear compra...');
    console.log(`   Rifa: ${TEST_DATA.raffleId}`);
    console.log(`   Pack: ${TEST_DATA.packId}`);
    console.log(`   Cantidad: ${TEST_DATA.quantity}`);
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
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Create purchase failed: ${response.status} - ${error}`);
    }
    const data = await response.json();
    console.log('✅ Compra creada exitosamente!');
    console.log(`   Purchase ID: ${data.id}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Total: $${data.totalAmount}`);
    console.log(`   Rifa: ${data.raffleName}`);
    console.log(`   Pack: ${data.packName}`);
    console.log(`   Cantidad: ${data.quantity}`);
    return data;
}
async function getMyPurchases(token) {
    console.log('\n📋 Paso 3: Ver compras del usuario...');
    const response = await fetch(`${BASE_URL}/purchases/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Get purchases failed: ${response.status} - ${error}`);
    }
    const data = await response.json();
    console.log(`✅ Encontradas ${data.length} compras`);
    data.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.raffleName} - $${p.totalAmount} - ${p.status}`);
    });
    return data;
}
async function verifyDatabase(purchaseId) {
    console.log('\n🔍 Paso 4: Verificar en base de datos...');
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.log('   ⚠️ DATABASE_URL no definida, saltando verificación de BD');
        return;
    }
    const adapter = new adapter_pg_1.PrismaPg({ connectionString: databaseUrl });
    const prisma = new client_1.PrismaClient({ adapter });
    try {
        const purchase = await prisma.purchase.findUnique({
            where: { id: purchaseId },
            include: { userPacks: true, paymentTransactions: true },
        });
        if (!purchase) {
            throw new Error('Purchase no encontrada en BD');
        }
        console.log('✅ Purchase en BD:');
        console.log(`   ID: ${purchase.id}`);
        console.log(`   Status: ${purchase.status}`);
        console.log(`   Total: $${purchase.totalAmount?.toString()}`);
        console.log(`   UserPacks: ${purchase.userPacks.length} registros`);
        console.log(`   PaymentTransactions: ${purchase.paymentTransactions.length} registros`);
        if (purchase.userPacks.length > 0) {
            console.log('✅ UserPack creado:');
            const up = purchase.userPacks[0];
            console.log(`   ID: ${up.id}`);
            console.log(`   Quantity: ${up.quantity}`);
            console.log(`   Total Paid: $${up.totalPaid?.toString()}`);
        }
        if (purchase.paymentTransactions.length > 0) {
            console.log('✅ PaymentTransaction creada:');
            const pt = purchase.paymentTransactions[0];
            console.log(`   ID: ${pt.id}`);
            console.log(`   Provider: ${pt.provider}`);
            console.log(`   Status: ${pt.status}`);
            console.log(`   Amount: $${pt.amount?.toString()}`);
        }
    }
    finally {
        await prisma.$disconnect();
    }
}
async function main() {
    console.log('🚀 Iniciando prueba de flujo de compras (Fase 6)');
    console.log('='.repeat(50));
    try {
        const token = await login();
        const purchase = await createPurchase(token);
        await getMyPurchases(token);
        await verifyDatabase(purchase.id);
        console.log('\n' + '='.repeat(50));
        console.log('✨ TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
        console.log('✅ Fase 6: Flujo de compras implementado correctamente');
    }
    catch (error) {
        console.error('\n❌ ERROR EN PRUEBA:');
        console.error(error.message);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=test-purchase-flow.js.map