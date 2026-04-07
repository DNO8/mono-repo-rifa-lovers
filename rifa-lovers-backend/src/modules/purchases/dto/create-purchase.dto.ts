import { IsUUID, IsNumber, IsNotEmpty } from 'class-validator'

export class CreatePurchaseDto {
  @IsUUID()
  @IsNotEmpty()
  raffleId: string

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number
}
