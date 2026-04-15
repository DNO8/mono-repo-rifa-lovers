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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const cron = __importStar(require("node-cron"));
let JobsService = JobsService_1 = class JobsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(JobsService_1.name);
        this.tasks = [];
    }
    onModuleInit() {
        this.logger.log('Inicializando jobs automáticos...');
        this.tasks.push(cron.schedule('*/5 * * * *', () => {
            void this.autoSoldOut();
        }));
        this.tasks.push(cron.schedule('2-59/5 * * * *', () => {
            void this.autoClosed();
        }));
        this.tasks.push(cron.schedule('*/15 * * * *', () => {
            void this.expirePendingPurchases();
        }));
        this.logger.log('✅ Jobs automáticos iniciados:');
        this.logger.log('   • Auto SOLD_OUT: cada 5 minutos');
        this.logger.log('   • Auto CLOSED: cada 5 minutos');
        this.logger.log('   • Expire Purchases: cada 15 minutos');
    }
    onModuleDestroy() {
        this.logger.log('Deteniendo jobs automáticos...');
        for (const task of this.tasks)
            void task.stop();
        this.logger.log('✅ Jobs detenidos');
    }
    async autoSoldOut() {
        this.logger.log('[JOB] Ejecutando Auto SOLD_OUT...');
        try {
            const rafflesToUpdate = await this.prisma.$queryRaw `
        SELECT r.id, r.title, rp.packs_sold, r.goal_packs
        FROM raffles r
        JOIN raffle_progress rp ON r.id = rp.raffle_id
        WHERE r.status = ${client_1.RaffleStatus.active}
          AND rp.packs_sold >= r.goal_packs
      `;
            if (rafflesToUpdate.length === 0) {
                this.logger.log('[JOB] Auto SOLD_OUT: No hay rifas para actualizar');
                return;
            }
            for (const raffle of rafflesToUpdate) {
                await this.prisma.raffle.update({
                    where: { id: raffle.id },
                    data: { status: client_1.RaffleStatus.sold_out },
                });
                this.logger.log(`[JOB] Rifa "${raffle.title || 'Sin título'}" (${raffle.id}) marcada como SOLD_OUT (${raffle.packs_sold}/${raffle.goal_packs} packs)`);
            }
            this.logger.log(`[JOB] Auto SOLD_OUT completado: ${rafflesToUpdate.length} rifas actualizadas`);
        }
        catch (error) {
            this.logger.error('[JOB] Error en Auto SOLD_OUT:', error);
        }
    }
    async autoClosed() {
        this.logger.log('[JOB] Ejecutando Auto CLOSED...');
        try {
            const now = new Date();
            const rafflesToClose = await this.prisma.raffle.findMany({
                where: {
                    status: {
                        in: [client_1.RaffleStatus.active, client_1.RaffleStatus.sold_out],
                    },
                    endDate: {
                        lte: now,
                    },
                },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    endDate: true,
                },
            });
            if (rafflesToClose.length === 0) {
                this.logger.log('[JOB] Auto CLOSED: No hay rifas para cerrar');
                return;
            }
            for (const raffle of rafflesToClose) {
                await this.prisma.raffle.update({
                    where: { id: raffle.id },
                    data: { status: client_1.RaffleStatus.closed },
                });
                this.logger.log(`[JOB] Rifa "${raffle.title || 'Sin título'}" (${raffle.id}) cerrada automáticamente (estaba: ${raffle.status})`);
            }
            this.logger.log(`[JOB] Auto CLOSED completado: ${rafflesToClose.length} rifas cerradas`);
        }
        catch (error) {
            this.logger.error('[JOB] Error en Auto CLOSED:', error);
        }
    }
    async expirePendingPurchases() {
        this.logger.log('[JOB] Ejecutando expiración de purchases...');
        try {
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            const purchasesToExpire = await this.prisma.purchase.findMany({
                where: {
                    status: client_1.PurchaseStatus.pending,
                    createdAt: {
                        lt: thirtyMinutesAgo,
                    },
                },
                select: {
                    id: true,
                    userId: true,
                    totalAmount: true,
                    createdAt: true,
                },
            });
            if (purchasesToExpire.length === 0) {
                this.logger.log('[JOB] No hay purchases para expirar');
                return;
            }
            for (const purchase of purchasesToExpire) {
                await this.prisma.purchase.update({
                    where: { id: purchase.id },
                    data: { status: client_1.PurchaseStatus.failed },
                });
                this.logger.log(`[JOB] Purchase ${purchase.id} expirada (creada: ${purchase.createdAt.toISOString()})`);
            }
            this.logger.log(`[JOB] Expiración completada: ${purchasesToExpire.length} purchases marcadas como failed`);
        }
        catch (error) {
            this.logger.error('[JOB] Error en expiración de purchases:', error);
        }
    }
    async runJobManually(jobName) {
        this.logger.log(`[JOB MANUAL] Ejecutando ${jobName} manualmente...`);
        try {
            switch (jobName) {
                case 'sold_out':
                    await this.autoSoldOut();
                    return { success: true, message: 'Job Auto SOLD_OUT ejecutado manualmente' };
                case 'closed':
                    await this.autoClosed();
                    return { success: true, message: 'Job Auto CLOSED ejecutado manualmente' };
                case 'expire_purchases':
                    await this.expirePendingPurchases();
                    return { success: true, message: 'Job Expirar Purchases ejecutado manualmente' };
                default:
                    return { success: false, message: 'Job no válido' };
            }
        }
        catch (error) {
            this.logger.error(`[JOB MANUAL] Error ejecutando ${jobName}:`, error);
            return { success: false, message: `Error: ${error}` };
        }
    }
    getJobsStatus() {
        const now = new Date();
        const next5Min = new Date(Math.ceil(now.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000));
        const next15Min = new Date(Math.ceil(now.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000));
        return {
            lastRun: {
                soldOut: null,
                closed: null,
                expirePurchases: null,
            },
            nextRun: {
                soldOut: next5Min,
                closed: next5Min,
                expirePurchases: next15Min,
            },
        };
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map