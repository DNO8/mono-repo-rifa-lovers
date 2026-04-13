import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, Min, MaxLength } from 'class-validator'
import { RaffleStatus } from '@prisma/client'

export class UpdateRaffleDto {
  @IsString()
  @MaxLength(200)
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @Min(1)
  @IsOptional()
  goalPacks?: number

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
