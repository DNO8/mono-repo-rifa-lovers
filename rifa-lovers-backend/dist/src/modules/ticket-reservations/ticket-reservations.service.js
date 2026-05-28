"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const ticket_reservations_repository_1 = require("./ticket-reservations.repository");
const RESERVATION_TTL_MINUTES = 15;
let TicketReservationsService = class TicketReservationsService {
    constructor(reservationsRepository, prisma) {
        this.reservationsRepository = reservationsRepository;
        this.prisma = prisma;
    }
    async reserve(userId, raffleId, ticketNumbers, purchaseId) {
        const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000);
        return this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw `
        SELECT id FROM public.raffles WHERE id = ${raffleId}::uuid FOR UPDATE
      `;
            const takenPasses = await tx.$queryRaw `
        SELECT ticket_number FROM public.lucky_passes
        WHERE raffle_id = ${raffleId}::uuid
          AND ticket_number = ANY(${ticketNumbers}::int[])
      `;
            const takenReservations = await tx.$queryRaw `
        SELECT ticket_number FROM public.ticket_reservations
        WHERE raffle_id = ${raffleId}::uuid
          AND ticket_number = ANY(${ticketNumbers}::int[])
          AND expires_at > NOW()
          AND purchase_id != ${purchaseId}::uuid
      `;
            const takenNumbers = [
                ...takenPasses.map((r) => r.ticket_number),
                ...takenReservations.map((r) => r.ticket_number),
            ];
            if (takenNumbers.length > 0) {
                throw new common_1.ConflictException(`Los números ${takenNumbers.join(', ')} ya están reservados o tomados por otro usuario.`);
            }
            await tx.$executeRaw `
        DELETE FROM public.ticket_reservations WHERE purchase_id = ${purchaseId}::uuid
      `;
            for (const ticketNumber of ticketNumbers) {
                await tx.$executeRaw `
          INSERT INTO public.ticket_reservations (id, raffle_id, ticket_number, user_id, purchase_id, expires_at, created_at)
          VALUES (gen_random_uuid(), ${raffleId}::uuid, ${ticketNumber}, ${userId}::uuid, ${purchaseId}::uuid, ${expiresAt}, NOW())
          ON CONFLICT (raffle_id, ticket_number) DO UPDATE
            SET expires_at = ${expiresAt}, purchase_id = ${purchaseId}::uuid, user_id = ${userId}::uuid
        `;
            }
            const rows = await tx.$queryRaw `
        SELECT * FROM public.ticket_reservations
        WHERE purchase_id = ${purchaseId}::uuid
      `;
            return rows.map((r) => ({
                id: r.id,
                raffleId: r.raffle_id,
                ticketNumber: r.ticket_number,
                userId: r.user_id,
                purchaseId: r.purchase_id,
                expiresAt: r.expires_at.toISOString(),
                createdAt: r.created_at.toISOString(),
            }));
        });
    }
    async getActiveReservationsForPurchase(purchaseId) {
        const rows = await this.reservationsRepository.findActiveByPurchase(purchaseId);
        return rows.map(toDto);
    }
    async getActiveReservationsForUser(userId) {
        const rows = await this.reservationsRepository.findActiveByUser(userId);
        return rows.map(toDto);
    }
    async release(purchaseId) {
        await this.reservationsRepository.deleteByPurchase(purchaseId);
    }
    async convertToLuckyPasses(purchaseId, userId, userPackId, raffleId, tx) {
        const reservations = await this.reservationsRepository.findByPurchase(purchaseId, tx);
        if (reservations.length === 0) {
            return [];
        }
        const ticketNumbers = reservations.map((r) => r.ticketNumber);
        await this.reservationsRepository.deleteByPurchase(purchaseId, tx);
        return ticketNumbers.map((n) => ({ ticketNumber: n }));
    }
    async isTicketReservedOrTaken(raffleId, ticketNumber, excludePurchaseId) {
        let rows;
        if (excludePurchaseId) {
            rows = await this.prisma.$queryRaw `
        SELECT COUNT(*)::text as count FROM public.ticket_reservations
        WHERE raffle_id = ${raffleId}::uuid
          AND ticket_number = ${ticketNumber}
          AND expires_at > NOW()
          AND purchase_id != ${excludePurchaseId}::uuid
      `;
        }
        else {
            rows = await this.prisma.$queryRaw `
        SELECT COUNT(*)::text as count FROM public.ticket_reservations
        WHERE raffle_id = ${raffleId}::uuid
          AND ticket_number = ${ticketNumber}
          AND expires_at > NOW()
      `;
        }
        return parseInt(rows[0]?.count ?? '0', 10) > 0;
    }
};
exports.TicketReservationsService = TicketReservationsService;
exports.TicketReservationsService = TicketReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ticket_reservations_repository_1.TicketReservationsRepository,
        prisma_service_1.PrismaService])
], TicketReservationsService);
function toDto(r) {
    return {
        id: r.id,
        raffleId: r.raffleId,
        ticketNumber: r.ticketNumber,
        userId: r.userId,
        purchaseId: r.purchaseId,
        expiresAt: r.expiresAt.toISOString(),
        createdAt: r.createdAt.toISOString(),
    };
}
//# sourceMappingURL=ticket-reservations.service.js.map