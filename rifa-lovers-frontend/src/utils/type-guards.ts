import type { CustomerDrawResult, CustomerDrawAvailability, RaffleDetails } from '@/types/streaming.types'

// Type Guards following TypeScript best practices
export function isCustomerDrawResult(value: unknown): value is CustomerDrawResult {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  
  const obj = value as Record<string, unknown>
  return (
    'winners' in obj &&
    'discarded' in obj &&
    Array.isArray(obj.winners) &&
    Array.isArray(obj.discarded)
  )
}

export function isCustomerDrawAvailability(value: unknown): value is CustomerDrawAvailability {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  
  const obj = value as Record<string, unknown>
  return (
    'canDraw' in obj &&
    typeof obj.canDraw === 'boolean' &&
    'participants' in obj &&
    Array.isArray(obj.participants) &&
    'prizesCount' in obj &&
    typeof obj.prizesCount === 'number' &&
    'activePassesCount' in obj &&
    typeof obj.activePassesCount === 'number'
  )
}

export function isRaffleDetails(value: unknown): value is RaffleDetails {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  
  const obj = value as Record<string, unknown>
  return (
    'id' in obj &&
    typeof obj.id === 'string' &&
    'title' in obj &&
    'status' in obj &&
    'goalPacks' in obj &&
    typeof obj.goalPacks === 'number' &&
    'maxTicketNumber' in obj &&
    typeof obj.maxTicketNumber === 'number' &&
    'createdAt' in obj &&
    typeof obj.createdAt === 'string'
  )
}

// Generic type guard for API responses
export function isValidApiResponse<T>(
  value: unknown,
  guard: (value: unknown) => value is T
): value is T {
  return guard(value)
}

// Safe API response parser
export function parseApiResponse<T>(
  response: unknown,
  guard: (value: unknown) => value is T,
  errorMessage: string = 'Invalid API response format'
): T {
  if (!isValidApiResponse(response, guard)) {
    throw new Error(errorMessage)
  }
  return response
}
