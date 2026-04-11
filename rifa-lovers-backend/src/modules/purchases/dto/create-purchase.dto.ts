import { IsUUID, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator'

export class CreatePurchaseDto {
  @IsUUID()
  @IsNotEmpty()
  raffleId: string

  @IsUUID()
  @IsNotEmpty()
  packId: string

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number

  @IsNumber()
  @IsOptional()
  selectedNumber?: number
}
