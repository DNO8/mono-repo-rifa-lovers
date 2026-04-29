import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator'

export class SubscribeDto {
  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string
}
