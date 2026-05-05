import { z } from 'zod'

/* ─── Profile form ─── */
export const profileSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(120, 'El nombre no puede exceder 120 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(120, 'El apellido no puede exceder 120 caracteres'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos').max(20, 'El teléfono no puede exceder 20 dígitos'),
})

export type ProfileFormData = z.infer<typeof profileSchema>

/* ─── Password form ───
   currentPassword is required whenever the user wants to change password.
   newPassword must be different from currentPassword. */
const _passwordBase = z.object({
  currentPassword: z.string().max(100),
  newPassword: z.string().max(100),
  confirmPassword: z.string().max(100),
})

function isChangingPassword(data: z.infer<typeof _passwordBase>) {
  return data.newPassword.length > 0 || data.confirmPassword.length > 0 || data.currentPassword.length > 0
}

export const passwordSchema = _passwordBase
  .refine(
    (data) => !isChangingPassword(data) || data.currentPassword.length > 0,
    { message: 'Ingresa tu contraseña actual', path: ['currentPassword'] }
  )
  .refine(
    (data) => !isChangingPassword(data) || data.newPassword.length >= 9,
    { message: 'La contraseña debe tener al menos 9 caracteres', path: ['newPassword'] }
  )
  .refine(
    (data) => !isChangingPassword(data) || data.newPassword === data.confirmPassword,
    { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] }
  )
  .refine(
    (data) => !isChangingPassword(data) || data.newPassword !== data.currentPassword,
    { message: 'La nueva contraseña no puede ser igual a la actual', path: ['newPassword'] }
  )

export type PasswordFormData = z.infer<typeof passwordSchema>

export interface ProfileValidationError {
  field: string
  message: string
}

function firstZodError(result: { success: true } | { success: false; error: z.ZodError<unknown> }): ProfileValidationError | null {
  if (result.success) return null
  const issue = result.error.issues[0]
  return { field: String(issue.path[0]), message: issue.message }
}

export function validateProfile(data: ProfileFormData): ProfileValidationError | null {
  return firstZodError(profileSchema.safeParse(data))
}

export function validatePassword(data: PasswordFormData): ProfileValidationError | null {
  return firstZodError(passwordSchema.safeParse(data))
}
