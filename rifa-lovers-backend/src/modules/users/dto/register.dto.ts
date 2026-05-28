import { IsEmail, IsNotEmpty, IsString, IsNumberString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser un string' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100, { message: 'La contraseña no puede exceder 100 caracteres' })
  password: string;

  @IsNumberString({}, { message: 'El teléfono debe contener solo números, sin el signo +' })
  @Matches(/^[0-9]+$/, { message: 'El teléfono solo puede contener dígitos del 0-9, no se permite el signo +' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' || typeof value === 'number') ? value.toString().replace(/[^0-9]/g, '') : value)
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  phone: string;

  @IsString({ message: 'El nombre debe ser un string' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(120, { message: 'El nombre no puede exceder 120 caracteres' })
  firstName: string;

  @IsString({ message: 'El apellido debe ser un string' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(120, { message: 'El apellido no puede exceder 120 caracteres' })
  lastName: string;

  @IsString({ message: 'La dirección debe ser un string' })
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(200, { message: 'La dirección no puede exceder 200 caracteres' })
  address: string;

  @IsString({ message: 'El token reCAPTCHA debe ser un string' })
  @IsNotEmpty({ message: 'El token reCAPTCHA es requerido' })
  recaptchaToken: string;

  @IsNotEmpty({ message: 'Debes aceptar los Términos y Condiciones' })
  acceptTerms: boolean;
}
