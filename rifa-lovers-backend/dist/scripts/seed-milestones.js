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
    console.log('🌱 Iniciando seed de milestones y premios...\n');
    const raffle = await prisma.raffle.findFirst({
        where: { status: 'active' },
    });
    if (!raffle) {
        console.error('❌ No hay rifa activa. Crea una rifa primero.');
        process.exit(1);
    }
    console.log(`✅ Rifa encontrada: ${raffle.title} (ID: ${raffle.id})`);
    console.log(`📊 Goal Packs: ${raffle.goalPacks}\n`);
    const milestoneDefinitions = [
        {
            percentage: 20,
            name: 'Primer Hito',
            prizeName: 'Gift Card $100.000',
            prizeDescription: 'Gift card para supermercado o retail',
            prizeEmoji: '🛒',
            sortOrder: 1,
        },
        {
            percentage: 40,
            name: 'Segundo Hito',
            prizeName: 'Respiro RifaLovers',
            prizeDescription: '$250.000 en vivo por transferencia',
            prizeEmoji: '💸',
            sortOrder: 2,
        },
        {
            percentage: 60,
            name: 'Tercer Hito',
            prizeName: 'Escapada RifaLovers',
            prizeDescription: 'Hotel + cena + experiencia para 2 personas',
            prizeEmoji: '🌊',
            sortOrder: 3,
        },
        {
            percentage: 80,
            name: 'Cuarto Hito',
            prizeName: 'Reimpulso RifaLovers',
            prizeDescription: '$250.000 adicionales en vivo',
            prizeEmoji: '💰',
            sortOrder: 4,
        },
        {
            percentage: 100,
            name: 'Meta Final',
            prizeName: 'Gran Desbloqueo',
            prizeDescription: 'MacBook Air M5 + Experiencia VIP',
            prizeEmoji: '🔓',
            sortOrder: 5,
        },
    ];
    for (const def of milestoneDefinitions) {
        const requiredPacks = Math.round((raffle.goalPacks * def.percentage) / 100);
        console.log(`🎯 Creando Milestone ${def.percentage}% (${requiredPacks} packs)...`);
        const existingMilestone = await prisma.milestone.findFirst({
            where: {
                raffleId: raffle.id,
                sortOrder: def.sortOrder,
            },
        });
        let milestone;
        if (existingMilestone) {
            milestone = await prisma.milestone.update({
                where: { id: existingMilestone.id },
                data: {
                    name: def.name,
                    requiredPacks,
                },
            });
            console.log(`  📝 Milestone actualizado: ${milestone.name}`);
        }
        else {
            milestone = await prisma.milestone.create({
                data: {
                    raffleId: raffle.id,
                    name: def.name,
                    requiredPacks,
                    sortOrder: def.sortOrder,
                    isUnlocked: false,
                },
            });
            console.log(`  ✅ Milestone creado: ${milestone.name}`);
        }
        const existingPrize = await prisma.prize.findFirst({
            where: {
                milestoneId: milestone.id,
            },
        });
        let prize;
        if (existingPrize) {
            prize = await prisma.prize.update({
                where: { id: existingPrize.id },
                data: {
                    name: def.prizeName,
                    description: def.prizeDescription,
                },
            });
            console.log(`  📝 Premio actualizado: ${prize.name}`);
        }
        else {
            prize = await prisma.prize.create({
                data: {
                    raffleId: raffle.id,
                    milestoneId: milestone.id,
                    type: 'milestone',
                    name: def.prizeName,
                    description: def.prizeDescription,
                    quantity: 1,
                },
            });
            console.log(`  ✅ Premio creado: ${prize.name}`);
        }
        console.log(`  🎁 ${def.prizeEmoji} ${prize.name}\n`);
    }
    console.log('✨ Seed completado exitosamente!');
    console.log(`\nResumen:`);
    console.log(`- Rifa: ${raffle.title}`);
    console.log(`- Goal Packs: ${raffle.goalPacks}`);
    console.log(`- Milestones creados: 5 (20%, 40%, 60%, 80%, 100%)`);
    console.log(`- Premios creados: 5`);
}
main()
    .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-milestones.js.map