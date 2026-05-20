import { IsString, IsNumber, IsOptional, IsBoolean, IsNotEmpty, Min, MaxLength } from 'class-validator'

export class CreatePackDto {
  @IsString()
  @MaxLength(100)
  name: string

  @IsNumber()
  @Min(0)
  price: number

  @IsNumber()
  @Min(1)
  luckyPassQuantity: number

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean

  @IsBoolean()
  @IsOptional()
  isPreSale?: boolean
}

export class UpdatePackDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number

  @IsNumber()
  @IsOptional()
  @Min(1)
  luckyPassQuantity?: number

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean

  @IsBoolean()
  @IsOptional()
  isPreSale?: boolean
}

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string

  @IsString()
  @IsOptional()
  @MaxLength(200)
  slug?: string
}
