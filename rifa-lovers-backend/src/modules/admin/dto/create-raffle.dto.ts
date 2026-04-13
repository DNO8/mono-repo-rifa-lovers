import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, Min, MaxLength } from 'class-validator'
import { RaffleStatus } from '@prisma/client'

export class CreateRaffleDto {
  @IsString()
  @MaxLength(200)
  title: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @Min(1)
  goalPacks: number

  @IsDateString()
  @IsOptional()
  startDate?: string

  @IsDateString()
  @IsOptional()
  endDate?: string

  @IsEnum(RaffleStatus)
  @IsOptional()
  status?: RaffleStatus
}
