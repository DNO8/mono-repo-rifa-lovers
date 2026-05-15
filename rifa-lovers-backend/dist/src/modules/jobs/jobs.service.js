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
const raffle_scheduler_service_1 = require("../raffles/raffle-scheduler.service");
const ticket_reservations_repository_1 = require("../ticket-reservations/ticket-reservations.repository");
const resend_service_1 = require("../email/resend.service");
const flow_service_1 = require("../payments/flow.service");
const purchases_service_1 = require("../purchases/purchases.service");
const cron = __importStar(require("node-cron"));
let JobsService = JobsService_1 = class JobsService {
    constructor(prisma, raffleSchedulerService, ticketReservationsRepository, resendService, flowService, purchasesService) {
        this.prisma = prisma;
        this.raffleSchedulerService = raffleSchedulerService;
        this.ticketReservationsRepository = ticketReservationsRepository;
        this.resendService = resendService;
        this.flowService = flowService;
        this.purchasesService = purchasesService;
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
        this.tasks.push(cron.schedule('*/3 * * * *', () => {
            void this.checkPendingPaymentsStatus();
        }));
        this.tasks.push(cron.schedule('*/15 * * * *', () => {
            void this.expirePendingPurchases();
        }));
        this.tasks.push(cron.schedule('* * * * *', () => {
            void this.closeExpiredRafflesByEndDate();
        }));
        this.tasks.push(cron.schedule('* * * * *', () => {
            void this.expireTicketReservations();
        }));
        this.logger.log('✅ Jobs automáticos iniciados:');
        this.logger.log('   • Auto SOLD_OUT: cada 5 minutos');
        this.logger.log('   • Auto CLOSED: cada 5 minutos');
        this.logger.log('   • Check Pending Payments: cada 3 minutos');
        this.logger.log('   • Expire Purchases: cada 15 minutos');
        this.logger.log('   • Close by EndDate: cada minuto');
        this.logger.log('   • Expire Ticket Reservations: cada minuto');
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
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
            const purchasesToExpire = await this.prisma.purchase.findMany({
                where: {
                    status: client_1.PurchaseStatus.pending,
                    createdAt: {
                        lt: fifteenMinutesAgo,
                    },
                },
                select: {
                    id: true,
                    userId: true,
                    totalAmount: true,
                    createdAt: true,
                    raffle: { select: { title: true } },
                    user: { select: { email: true, firstName: true, lastName: true } },
                    paymentTransactions: {
                        select: { providerTransactionId: true },
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
            if (purchasesToExpire.length === 0) {
                this.logger.log('[JOB] No hay purchases para expirar');
                return;
            }
            const CONCURRENCY = 5;
            const results = { confirmed: 0, failed: 0, errors: 0 };
            for (let i = 0; i < purchasesToExpire.length; i += CONCURRENCY) {
                const batch = purchasesToExpire.slice(i, i + CONCURRENCY);
                const batchResults = await Promise.allSettled(batch.map((purchase) => this.processExpiredPurchase(purchase)));
                batchResults.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        if (result.value === 'confirmed')
                            results.confirmed++;
                        else if (result.value === 'failed')
                            results.failed++;
                    }
                    else {
                        results.errors++;
                        this.logger.error(`[JOB] Error procesando purchase: ${result.reason}`);
                    }
                });
            }
            this.logger.log(`[JOB] Expiración completada: ${purchasesToExpire.length} procesadas — confirmadas=${results.confirmed}, failed=${results.failed}, errores=${results.errors}`);
        }
        catch (error) {
            this.logger.error('[JOB] Error en expiración de purchases:', error);
        }
    }
    async processExpiredPurchase(purchase) {
        const token = purchase.paymentTransactions[0]?.providerTransactionId;
        let flowStatus = 1;
        if (token) {
            try {
                const paymentStatus = await this.flowService.getPaymentStatus(token);
                flowStatus = paymentStatus.status;
                this.logger.log(`[JOB] Flow status para purchase ${purchase.id}: ${flowStatus}`);
            }
            catch (err) {
                this.logger.error(`[JOB] Error consultando Flow para ${purchase.id}: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
        if (flowStatus === 2) {
            this.logger.log(`[JOB] Purchase ${purchase.id} está pagada en Flow. Confirmando...`);
            try {
                await this.purchasesService.confirmPayment(purchase.id, {
                    providerTransactionId: token ?? 'unknown',
                    provider: 'flow',
                    status: 'approved',
                });
                return 'confirmed';
            }
            catch (err) {
                this.logger.error(`[JOB] Error confirmando purchase ${purchase.id}: ${err instanceof Error ? err.message : String(err)}`);
                throw err;
            }
        }
        try {
            await this.prisma.purchase.update({
                where: { id: purchase.id },
                data: { status: client_1.PurchaseStatus.failed },
            });
            await this.prisma.paymentTransaction.updateMany({
                where: { purchaseId: purchase.id },
                data: { status: 'rejected', idempotencyKey: null },
            });
        }
        catch (dbErr) {
            this.logger.error(`[JOB] Error actualizando purchase ${purchase.id} a failed: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`);
            throw dbErr;
        }
        try {
            const user = purchase.user;
            if (user?.email) {
                if (flowStatus === 3 || flowStatus === 4) {
                    void this.resendService.sendFailedPaymentEmail({
                        toEmail: user.email,
                        toName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Participante',
                        purchaseId: purchase.id,
                        raffleName: purchase.raffle?.title ?? null,
                        amount: Number(purchase.totalAmount ?? 0),
                    });
                }
                else {
                    void this.resendService.sendIncompletePaymentEmail({
                        toEmail: user.email,
                        toName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Participante',
                        purchaseId: purchase.id,
                        raffleName: purchase.raffle?.title ?? null,
                        amount: Number(purchase.totalAmount ?? 0),
                    });
                }
            }
        }
        catch (err) {
            this.logger.error(`Error enviando email desde job: ${err instanceof Error ? err.message : String(err)}`);
        }
        this.logger.log(`[JOB] Purchase ${purchase.id} marcada como failed (Flow status: ${flowStatus})`);
        return 'failed';
    }
    async checkPendingPaymentsStatus() {
        this.logger.log('[JOB] Ejecutando verificación temprana de pagos pendientes...');
        try {
            const now = Date.now();
            const threeMinutesAgo = new Date(now - 3 * 60 * 1000);
            const fifteenMinutesAgo = new Date(now - 15 * 60 * 1000);
            const purchasesToCheck = await this.prisma.purchase.findMany({
                where: {
                    status: client_1.PurchaseStatus.pending,
                    createdAt: {
                        gte: fifteenMinutesAgo,
                        lt: threeMinutesAgo,
                    },
                },
                select: {
                    id: true,
                    userId: true,
                    totalAmount: true,
                    createdAt: true,
                    raffle: { select: { title: true } },
                    user: { select: { email: true, firstName: true, lastName: true } },
                    paymentTransactions: {
                        select: { providerTransactionId: true },
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
            if (purchasesToCheck.length === 0) {
                return;
            }
            this.logger.log(`[JOB] Verificando ${purchasesToCheck.length} pagos pendientes con Flow...`);
            for (const purchase of purchasesToCheck) {
                const token = purchase.paymentTransactions[0]?.providerTransactionId;
                if (!token)
                    continue;
                let flowStatus = 1;
                try {
                    const paymentStatus = await this.flowService.getPaymentStatus(token);
                    flowStatus = paymentStatus.status;
                    this.logger.log(`[JOB] Flow status temprano para purchase ${purchase.id}: ${flowStatus}`);
                }
                catch (err) {
                    this.logger.error(`[JOB] Error consultando Flow para ${purchase.id}: ${err instanceof Error ? err.message : String(err)}`);
                    continue;
                }
                if (flowStatus === 2) {
                    this.logger.log(`[JOB] Purchase ${purchase.id} pagada en Flow. Confirmando...`);
                    try {
                        await this.purchasesService.confirmPayment(purchase.id, {
                            providerTransactionId: token,
                            provider: 'flow',
                            status: 'approved',
                        });
                    }
                    catch (err) {
                        this.logger.error(`[JOB] Error confirmando purchase ${purchase.id}: ${err instanceof Error ? err.message : String(err)}`);
                    }
                }
                else if (flowStatus === 3 || flowStatus === 4) {
                    this.logger.log(`[JOB] Purchase ${purchase.id} rechazada/anulada en Flow. Marcando failed...`);
                    try {
                        await this.prisma.purchase.update({
                            where: { id: purchase.id },
                            data: { status: client_1.PurchaseStatus.failed },
                        });
                        await this.prisma.paymentTransaction.updateMany({
                            where: { purchaseId: purchase.id },
                            data: { status: 'rejected', idempotencyKey: null },
                        });
                    }
                    catch (dbErr) {
                        this.logger.error(`[JOB] Error actualizando purchase ${purchase.id}: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`);
                        continue;
                    }
                    const user = purchase.user;
                    if (user?.email) {
                        void this.resendService.sendFailedPaymentEmail({
                            toEmail: user.email,
                            toName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Participante',
                            purchaseId: purchase.id,
                            raffleName: purchase.raffle?.title ?? null,
                            amount: Number(purchase.totalAmount ?? 0),
                        });
                    }
                }
            }
            this.logger.log(`[JOB] Verificación temprana completada: ${purchasesToCheck.length} purchases revisadas`);
        }
        catch (error) {
            this.logger.error('[JOB] Error en verificación temprana de pagos:', error);
        }
    }
    async closeExpiredRafflesByEndDate() {
        try {
            const result = await this.raffleSchedulerService.closeExpiredRaffles();
            if (result.closed > 0) {
                this.logger.log(`✅ Auto-cierre por endDate: ${result.closed} rifas cerradas`);
            }
            if (result.errors.length > 0) {
                this.logger.error(`❌ Errores en auto-cierre: ${result.errors.join(', ')}`);
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error ejecutando auto-cierre por endDate: ${message}`);
        }
    }
    async expireTicketReservations() {
        try {
            const deleted = await this.ticketReservationsRepository.deleteExpired();
            if (deleted > 0) {
                this.logger.log(`[JOB] Expiradas ${deleted} reservas de tickets vencidas`);
            }
        }
        catch (error) {
            this.logger.error('[JOB] Error expirando reservas de tickets:', error);
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        raffle_scheduler_service_1.RaffleSchedulerService,
        ticket_reservations_repository_1.TicketReservationsRepository,
        resend_service_1.ResendService,
        flow_service_1.FlowService,
        purchases_service_1.PurchasesService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map