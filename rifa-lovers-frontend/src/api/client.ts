/**
 * Composed API client using Decorator pattern:
 *   FetchHttpClient → AuthDecorator → LoggingDecorator
 *
 * Each decorator adds a single cross-cutting concern.
 * The exported `apiClient` is the fully decorated instance.
 */

import { FetchHttpClient, ApiError } from './clients/http-client'
import { AuthDecorator } from './clients/auth.decorator'
import { LoggingDecorator } from './clients/logging.decorator'
import type { HttpClient } from './clients/http-client'

function createApiClient(): HttpClient {
  const base = new FetchHttpClient()
  const withAuth = new AuthDecorator(base)
  const withLogging = new LoggingDecorator(withAuth)
  return withLogging
}

export const apiClient = createApiClient()

export { ApiError }
export type { HttpClient } from './clients/http-client'
