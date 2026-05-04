import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, Min, MaxLength, ValidateNested, ArrayMinSize } from 'class-validator'
import { Type } from 'class-transformer'
import { RaffleStatus } from '@prisma/client'

export class CreatePrizeDto {
  @IsString()
  @MaxLength(255)
  name: string

  @IsString()
  @IsOptional()
  description?: string
}

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

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxTicketNumber?: number

  @IsDateString()
  @IsOptional()
  startDate?: string

  @IsDateString()
  @IsOptional()
  endDate?: string

  @IsEnum(RaffleStatus)
  @IsOptional()
  status?: RaffleStatus

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePrizeDto)
  @ArrayMinSize(1, { message: 'Debe incluir al menos un premio' })
  prizes?: CreatePrizeDto[]
}
