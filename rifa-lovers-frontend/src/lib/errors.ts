import { toast } from 'react-toastify'
import { ApiError } from '@/api/client'

type ErrorContext = 'auth' | 'login' | 'register' | 'payment' | 'general'

/**
 * Extrae un mensaje de error amigable para el usuario.
 * Nunca expone códigos HTTP ni mensajes técnicos.
 */
export function getErrorMessage(
  err: unknown,
  context?: ErrorContext,
  fallback = 'Ocurrió un error inesperado. Por favor intenta más tarde.',
): string {
  if (err instanceof ApiError) return err.getUserMessage(context)
  return fallback
}

/**
 * Muestra un toast de error con mensaje amigable.
 * Retorna el mensaje para usos adicionales (ej: setState).
 */
export function toastError(
  err: unknown,
  context?: ErrorContext,
  fallback?: string,
): string {
  const message = getErrorMessage(err, context, fallback)
  toast.error(message)
  return message
}
