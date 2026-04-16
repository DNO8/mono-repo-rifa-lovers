"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BASE_URL = 'http://localhost:3000';
async function testGetAllPacks() {
    console.log('📦 Paso 1: Listar todos los packs...');
    const response = await fetch(`${BASE_URL}/packs`);
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`GET /packs failed: ${response.status} - ${error}`);
    }
    const data = await response.json();
    console.log('✅ Packs encontrados:', data.length);
    data.forEach((pack, i) => {
        console.log(`\n  ${i + 1}. ${pack.name}`);
        console.log(`     ID: ${pack.id}`);
        console.log(`     Precio: $${pack.price}`);
        console.log(`     LuckyPasses: ${pack.luckyPassQuantity}`);
        console.log(`     Featured: ${pack.isFeatured}`);
    });
    return data;
}
async function testGetPackById(packId) {
    console.log(`\n📦 Paso 2: Obtener pack por ID (${packId})...`);
    const response = await fetch(`${BASE_URL}/packs/${packId}`);
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`GET /packs/${packId} failed: ${response.status} - ${error}`);
    }
    const data = await response.json();
    console.log('✅ Pack encontrado:');
    console.log(`   Nombre: ${data.name}`);
    console.log(`   Precio: $${data.price}`);
    console.log(`   LuckyPassQuantity: ${data.luckyPassQuantity}`);
    return data;
}
async function main() {
    console.log('🚀 Iniciando prueba de endpoints Packs (Fase 7)');
    console.log('='.repeat(50));
    try {
        const packs = await testGetAllPacks();
        if (packs.length > 0) {
            await testGetPackById(packs[0].id);
        }
        console.log('\n' + '='.repeat(50));
        console.log('✨ TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
        console.log('✅ Fase 7: Endpoints de Packs funcionando correctamente');
    }
    catch (error) {
        console.error('\n❌ ERROR EN PRUEBA:');
        console.error(error.message);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=test-packs-endpoint.js.map