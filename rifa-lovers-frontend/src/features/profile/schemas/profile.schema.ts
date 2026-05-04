export const PROFILE_FIELD_MIN_LENGTH = {
  name: 2,
  phone: 8,
  password: 9,
} as const

export const PROFILE_FIELD_MAX_LENGTH = {
  name: 120,
  phone: 20,
  password: 100,
} as const

export interface ProfileFormData {
  firstName: string
  lastName: string
  phone: string
}

export interface PasswordFormData {
  newPassword: string
  confirmPassword: string
}

export interface ProfileValidationError {
  field: string
  message: string
}

export function validateProfile(data: ProfileFormData): ProfileValidationError | null {
  if (data.firstName.length < PROFILE_FIELD_MIN_LENGTH.name) {
    return { field: 'firstName', message: `El nombre debe tener al menos ${PROFILE_FIELD_MIN_LENGTH.name} caracteres` }
  }
  if (data.firstName.length > PROFILE_FIELD_MAX_LENGTH.name) {
    return { field: 'firstName', message: `El nombre no puede exceder ${PROFILE_FIELD_MAX_LENGTH.name} caracteres` }
  }

  if (data.lastName.length < PROFILE_FIELD_MIN_LENGTH.name) {
    return { field: 'lastName', message: `El apellido debe tener al menos ${PROFILE_FIELD_MIN_LENGTH.name} caracteres` }
  }
  if (data.lastName.length > PROFILE_FIELD_MAX_LENGTH.name) {
    return { field: 'lastName', message: `El apellido no puede exceder ${PROFILE_FIELD_MAX_LENGTH.name} caracteres` }
  }

  if (data.phone.length < PROFILE_FIELD_MIN_LENGTH.phone) {
    return { field: 'phone', message: `El teléfono debe tener al menos ${PROFILE_FIELD_MIN_LENGTH.phone} dígitos` }
  }

  return null
}

export function validatePassword(data: PasswordFormData): ProfileValidationError | null {
  if (data.newPassword.length > 0) {
    if (data.newPassword.length < PROFILE_FIELD_MIN_LENGTH.password) {
      return { field: 'newPassword', message: `La contraseña debe tener al menos ${PROFILE_FIELD_MIN_LENGTH.password} caracteres` }
    }
    if (data.newPassword !== data.confirmPassword) {
      return { field: 'confirmPassword', message: 'Las contraseñas no coinciden' }
    }
  }

  return null
}
