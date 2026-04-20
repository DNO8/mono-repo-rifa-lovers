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
exports.TicketReservationsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
function mapRow(row) {
    return {
        id: row.id,
        raffleId: row.raffle_id,
        ticketNumber: row.ticket_number,
        userId: row.user_id,
        purchaseId: row.purchase_id,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
    };
}
let TicketReservationsRepository = class TicketReservationsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findActiveByRaffleAndTickets(raffleId, ticketNumbers, tx) {
        const client = (tx ?? this.prisma);
        const rows = await client.$queryRaw `
      SELECT * FROM public.ticket_reservations
      WHERE raffle_id = ${raffleId}::uuid
        AND ticket_number = ANY(${ticketNumbers}::int[])
        AND expires_at > NOW()
    `;
        return rows.map(mapRow);
    }
    async findActiveByPurchase(purchaseId) {
        const rows = await this.prisma.$queryRaw `
      SELECT * FROM public.ticket_reservations
      WHERE purchase_id = ${purchaseId}::uuid
        AND expires_at > NOW()
    `;
        return rows.map(mapRow);
    }
    async findByPurchase(purchaseId, tx) {
        const client = (tx ?? this.prisma);
        const rows = await client.$queryRaw `
      SELECT * FROM public.ticket_reservations
      WHERE purchase_id = ${purchaseId}::uuid
    `;
        return rows.map(mapRow);
    }
    async findActiveByUser(userId) {
        const rows = await this.prisma.$queryRaw `
      SELECT * FROM public.ticket_reservations
      WHERE user_id = ${userId}::uuid
        AND expires_at > NOW()
    `;
        return rows.map(mapRow);
    }
    async createMany(data, tx) {
        const client = (tx ?? this.prisma);
        for (const row of data) {
            await client.$executeRaw `
        INSERT INTO public.ticket_reservations (id, raffle_id, ticket_number, user_id, purchase_id, expires_at, created_at)
        VALUES (gen_random_uuid(), ${row.raffleId}::uuid, ${row.ticketNumber}, ${row.userId}::uuid, ${row.purchaseId}::uuid, ${row.expiresAt}, NOW())
        ON CONFLICT (raffle_id, ticket_number) DO NOTHING
      `;
        }
    }
    async deleteByPurchase(purchaseId, tx) {
        const client = (tx ?? this.prisma);
        await client.$executeRaw `
      DELETE FROM public.ticket_reservations WHERE purchase_id = ${purchaseId}::uuid
    `;
    }
    async deleteExpired() {
        const result = await this.prisma.$executeRaw `
      DELETE FROM public.ticket_reservations WHERE expires_at < NOW()
    `;
        return result;
    }
};
exports.TicketReservationsRepository = TicketReservationsRepository;
exports.TicketReservationsRepository = TicketReservationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketReservationsRepository);
//# sourceMappingURL=ticket-reservations.repository.js.map