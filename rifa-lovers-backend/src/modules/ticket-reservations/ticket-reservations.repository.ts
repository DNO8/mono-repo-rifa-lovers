import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

export interface TicketReservationRow {
  id: string
  raffle_id: string
  ticket_number: number
  user_id: string
  purchase_id: string | null
  expires_at: Date
  created_at: Date
}

export interface TicketReservation {
  id: string
  raffleId: string
  ticketNumber: number
  userId: string
  purchaseId: string | null
  expiresAt: Date
  createdAt: Date
}

function mapRow(row: TicketReservationRow): TicketReservation {
  return {
    id: row.id,
    raffleId: row.raffle_id,
    ticketNumber: row.ticket_number,
    userId: row.user_id,
    purchaseId: row.purchase_id,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }
}

@Injectable()
export class TicketReservationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByRaffleAndTickets(
    raffleId: string,
    ticketNumbers: number[],
    tx?: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  ): Promise<TicketReservation[]> {
    const client = (tx ?? this.prisma) as PrismaService
    const rows = await client.$queryRaw<TicketReservationRow[]>`
      SELECT * FROM public.ticket_reservations
      WHERE raffle_id = ${raffleId}::uuid
        AND ticket_number = ANY(${ticketNumbers}::int[])
        AND expires_at > NOW()
    `
    return rows.map(mapRow)
  }

  async findActiveByPurchase(purchaseId: string): Promise<TicketReservation[]> {
    const rows = await this.prisma.$queryRaw<TicketReservationRow[]>`
      SELECT * FROM public.ticket_reservations
      WHERE purchase_id = ${purchaseId}::uuid
        AND expires_at > NOW()
    `
    return rows.map(mapRow)
  }

  async findByPurchase(
    purchaseId: string,
    tx?: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  ): Promise<TicketReservation[]> {
    const client = (tx ?? this.prisma) as PrismaService
    const rows = await client.$queryRaw<TicketReservationRow[]>`
      SELECT * FROM public.ticket_reservations
      WHERE purchase_id = ${purchaseId}::uuid
    `
    return rows.map(mapRow)
  }

  async findActiveByUser(userId: string): Promise<TicketReservation[]> {
    const rows = await this.prisma.$queryRaw<TicketReservationRow[]>`
      SELECT * FROM public.ticket_reservations
      WHERE user_id = ${userId}::uuid
        AND expires_at > NOW()
    `
    return rows.map(mapRow)
  }

  async createMany(
    data: {
      raffleId: string
      ticketNumber: number
      userId: string
      purchaseId: string
      expiresAt: Date
    }[],
    tx?: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  ): Promise<void> {
    const client = (tx ?? this.prisma) as PrismaService
    for (const row of data) {
      await client.$executeRaw`
        INSERT INTO public.ticket_reservations (id, raffle_id, ticket_number, user_id, purchase_id, expires_at, created_at)
        VALUES (gen_random_uuid(), ${row.raffleId}::uuid, ${row.ticketNumber}, ${row.userId}::uuid, ${row.purchaseId}::uuid, ${row.expiresAt}, NOW())
        ON CONFLICT (raffle_id, ticket_number) DO NOTHING
      `
    }
  }

  async deleteByPurchase(
    purchaseId: string,
    tx?: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  ): Promise<void> {
    const client = (tx ?? this.prisma) as PrismaService
    await client.$executeRaw`
      DELETE FROM public.ticket_reservations WHERE purchase_id = ${purchaseId}::uuid
    `
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.$executeRaw`
      DELETE FROM public.ticket_reservations WHERE expires_at < NOW()
    `
    return result
  }
}
