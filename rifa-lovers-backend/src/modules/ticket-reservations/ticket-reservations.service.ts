import {
  Injectable,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { TicketReservationsRepository, TicketReservation } from './ticket-reservations.repository'
import { TicketReservationResponseDto } from './dto'

const RESERVATION_TTL_MINUTES = 15

@Injectable()
export class TicketReservationsService {
  constructor(
    private readonly reservationsRepository: TicketReservationsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async reserve(
    userId: string,
    raffleId: string,
    ticketNumbers: number[],
    purchaseId: string,
  ): Promise<TicketReservationResponseDto[]> {
    const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000)

    return this.prisma.$transaction(async (tx) => {
      // Lock raffle row to serialize concurrent reservations
      await tx.$executeRaw`
        SELECT id FROM public.raffles WHERE id = ${raffleId}::uuid FOR UPDATE
      `

      // Check against lucky_passes (already confirmed tickets)
      const takenPasses = await tx.$queryRaw<{ ticket_number: number }[]>`
        SELECT ticket_number FROM public.lucky_passes
        WHERE raffle_id = ${raffleId}::uuid
          AND ticket_number = ANY(${ticketNumbers}::int[])
      `

      // Check against active reservations NOT owned by this purchase
      const takenReservations = await tx.$queryRaw<{ ticket_number: number }[]>`
        SELECT ticket_number FROM public.ticket_reservations
        WHERE raffle_id = ${raffleId}::uuid
          AND ticket_number = ANY(${ticketNumbers}::int[])
          AND expires_at > NOW()
          AND purchase_id != ${purchaseId}::uuid
      `

      const takenNumbers = [
        ...takenPasses.map((r) => r.ticket_number),
        ...takenReservations.map((r) => r.ticket_number),
      ]

      if (takenNumbers.length > 0) {
        throw new ConflictException(
          `Los números ${takenNumbers.join(', ')} ya están reservados o tomados por otro usuario.`,
        )
      }

      // Delete any previous reservations for this purchase (e.g. re-selection)
      await tx.$executeRaw`
        DELETE FROM public.ticket_reservations WHERE purchase_id = ${purchaseId}::uuid
      `

      // Insert new reservations
      for (const ticketNumber of ticketNumbers) {
        await tx.$executeRaw`
          INSERT INTO public.ticket_reservations (id, raffle_id, ticket_number, user_id, purchase_id, expires_at, created_at)
          VALUES (gen_random_uuid(), ${raffleId}::uuid, ${ticketNumber}, ${userId}::uuid, ${purchaseId}::uuid, ${expiresAt}, NOW())
          ON CONFLICT (raffle_id, ticket_number) DO UPDATE
            SET expires_at = ${expiresAt}, purchase_id = ${purchaseId}::uuid, user_id = ${userId}::uuid
        `
      }

      const rows = await tx.$queryRaw<{
        id: string; raffle_id: string; ticket_number: number; user_id: string;
        purchase_id: string | null; expires_at: Date; created_at: Date
      }[]>`
        SELECT * FROM public.ticket_reservations
        WHERE purchase_id = ${purchaseId}::uuid
      `

      return rows.map((r) => ({
        id: r.id,
        raffleId: r.raffle_id,
        ticketNumber: r.ticket_number,
        userId: r.user_id,
        purchaseId: r.purchase_id,
        expiresAt: r.expires_at.toISOString(),
        createdAt: r.created_at.toISOString(),
      }))
    })
  }

  async getActiveReservationsForPurchase(purchaseId: string): Promise<TicketReservationResponseDto[]> {
    const rows = await this.reservationsRepository.findActiveByPurchase(purchaseId)
    return rows.map(toDto)
  }

  async getActiveReservationsForUser(userId: string): Promise<TicketReservationResponseDto[]> {
    const rows = await this.reservationsRepository.findActiveByUser(userId)
    return rows.map(toDto)
  }

  async release(purchaseId: string): Promise<void> {
    await this.reservationsRepository.deleteByPurchase(purchaseId)
  }

  async convertToLuckyPasses(
    purchaseId: string,
    userId: string,
    userPackId: string,
    raffleId: string,
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  ): Promise<{ ticketNumber: number }[]> {
    const reservations = await this.reservationsRepository.findByPurchase(purchaseId, tx)

    if (reservations.length === 0) {
      return []
    }

    const ticketNumbers = reservations.map((r) => r.ticketNumber)

    await this.reservationsRepository.deleteByPurchase(purchaseId, tx)

    return ticketNumbers.map((n) => ({ ticketNumber: n }))
  }

  async isTicketReservedOrTaken(
    raffleId: string,
    ticketNumber: number,
    excludePurchaseId?: string,
  ): Promise<boolean> {
    let rows: { count: string }[]
    if (excludePurchaseId) {
      rows = await this.prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM public.ticket_reservations
        WHERE raffle_id = ${raffleId}::uuid
          AND ticket_number = ${ticketNumber}
          AND expires_at > NOW()
          AND purchase_id != ${excludePurchaseId}::uuid
      `
    } else {
      rows = await this.prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM public.ticket_reservations
        WHERE raffle_id = ${raffleId}::uuid
          AND ticket_number = ${ticketNumber}
          AND expires_at > NOW()
      `
    }
    return parseInt(rows[0]?.count ?? '0', 10) > 0
  }
}

function toDto(r: TicketReservation): TicketReservationResponseDto {
  return {
    id: r.id,
    raffleId: r.raffleId,
    ticketNumber: r.ticketNumber,
    userId: r.userId,
    purchaseId: r.purchaseId,
    expiresAt: r.expiresAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }
}
