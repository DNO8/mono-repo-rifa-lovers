import { IsUUID, IsNumber, IsNotEmpty, IsOptional, Min, IsArray, ArrayUnique, IsInt } from 'class-validator'

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

  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @IsOptional()
  selectedNumbers?: number[]
}
