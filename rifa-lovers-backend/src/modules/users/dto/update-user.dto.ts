import { IsOptional, IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser un string' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(120, { message: 'El nombre no puede exceder 120 caracteres' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser un string' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(120, { message: 'El apellido no puede exceder 120 caracteres' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'La nueva contraseña debe ser un string' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100, { message: 'La contraseña no puede exceder 100 caracteres' })
  newPassword?: string;
}
