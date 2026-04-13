import { IsEnum } from 'class-validator'
import { RaffleStatus } from '@prisma/client'

export class UpdateRaffleStatusDto {
  @IsEnum(RaffleStatus)
  status: RaffleStatus
}
