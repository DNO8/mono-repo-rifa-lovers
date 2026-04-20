import { IsUUID, IsArray, IsInt, Min, ArrayNotEmpty } from 'class-validator'

export class ReserveTicketsDto {
  @IsUUID()
  raffleId: string

  @IsUUID()
  purchaseId: string

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ticketNumbers: number[]
}

export class TicketReservationResponseDto {
  id: string
  raffleId: string
  ticketNumber: number
  userId: string
  purchaseId: string | null
  expiresAt: string
  createdAt: string
}
