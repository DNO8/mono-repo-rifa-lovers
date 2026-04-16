"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL no está definida en .env');
    process.exit(1);
}
const adapter = new adapter_pg_1.PrismaPg({ connectionString: databaseUrl });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Iniciando seed de packs...\n');
    const packDefinitions = [
        {
            name: 'Pack Básico',
            price: 2990,
            luckyPassQuantity: 1,
            isFeatured: false,
            isPreSale: false,
        },
        {
            name: 'Pack Popular',
            price: 4990,
            luckyPassQuantity: 2,
            isFeatured: true,
            isPreSale: false,
        },
        {
            name: 'Pack Máximo',
            price: 9990,
            luckyPassQuantity: 5,
            isFeatured: false,
            isPreSale: false,
        },
    ];
    for (const def of packDefinitions) {
        const existingPack = await prisma.pack.findFirst({
            where: { name: def.name },
        });
        if (existingPack) {
            const updated = await prisma.pack.update({
                where: { id: existingPack.id },
                data: {
                    price: def.price,
                    luckyPassQuantity: def.luckyPassQuantity,
                    isFeatured: def.isFeatured,
                },
            });
            console.log(`  📝 Pack actualizado: ${updated.name} ($${def.price})`);
        }
        else {
            const created = await prisma.pack.create({
                data: {
                    name: def.name,
                    price: def.price,
                    luckyPassQuantity: def.luckyPassQuantity,
                    isFeatured: def.isFeatured,
                    isPreSale: def.isPreSale,
                },
            });
            console.log(`  ✅ Pack creado: ${created.name} ($${def.price}) - ID: ${created.id}`);
        }
    }
    console.log('\n✨ Seed de packs completado exitosamente!');
}
main()
    .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-packs.js.map