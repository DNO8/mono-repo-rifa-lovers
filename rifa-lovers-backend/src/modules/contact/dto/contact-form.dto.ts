import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator'

export class ContactFormDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string

  @IsEmail({}, { message: 'Debes proporcionar un email válido' })
  email: string

  @IsString()
  @MinLength(10, { message: 'El mensaje debe tener al menos 10 caracteres' })
  @MaxLength(2000, { message: 'El mensaje no puede exceder 2000 caracteres' })
  message: string
}
