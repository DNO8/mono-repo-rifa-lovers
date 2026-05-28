import { UseGuards, UseInterceptors, applyDecorators } from '@nestjs/common'
import { IdempotencyGuard } from '../guards/idempotency.guard'
import { IdempotencyInterceptor } from '../interceptors/idempotency.interceptor'

/**
 * Marks an endpoint as idempotent. Requires the X-Idempotency-Key header
 * for duplicate detection and caches the response for replay.
 */
export function Idempotent() {
  return applyDecorators(
    UseGuards(IdempotencyGuard),
    UseInterceptors(IdempotencyInterceptor),
  )
}
