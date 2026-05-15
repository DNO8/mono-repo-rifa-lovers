import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function scrollToPricing() {
  const el = document.getElementById('pricing')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

export function goToPricing() {
  window.location.href = '/#pricing'
}

/**
 * Convierte una fecha y hora local (Chile, UTC-4) a ISO string UTC.
 * Si no hay fecha, retorna undefined.
 */
export function toUTC(date: string, time: string): string | undefined {
  if (!date) return undefined
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  const chileDate = new Date(Date.UTC(year, month - 1, day, hours + 4, minutes))
  return chileDate.toISOString()
}

/**
 * Parsea una fecha UTC a componentes de fecha y hora en zona Chile (UTC-4).
 * Util para poblar inputs date/time a partir de valores del backend.
 */
export function parseInitialDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return { date: '', time: '' }
  const date = new Date(dateStr)
  const chileDate = new Date(date.getTime() - (4 * 60 * 60 * 1000))
  return {
    date: chileDate.toISOString().slice(0, 10),
    time: chileDate.toISOString().slice(11, 16),
  }
}
