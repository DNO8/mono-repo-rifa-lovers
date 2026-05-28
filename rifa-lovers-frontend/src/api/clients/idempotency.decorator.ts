/**
 * IdempotencyDecorator — adds an X-Idempotency-Key header to every
 * POST/PUT/PATCH request using a UUID v4.
 */

import type { HttpClient, HttpRequestOptions } from './http-client'

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export class IdempotencyDecorator implements HttpClient {
  constructor(private client: HttpClient) {}

  get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.client.get<T>(path, options)
  }

  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.client.post<T>(path, body, this.withKey(options))
  }

  put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.client.put<T>(path, body, this.withKey(options))
  }

  patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.client.patch<T>(path, body, this.withKey(options))
  }

  delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.client.delete<T>(path, options)
  }

  private withKey(options?: HttpRequestOptions): HttpRequestOptions {
    const existingKey = options?.headers?.['X-Idempotency-Key']
    return {
      ...options,
      headers: {
        ...options?.headers,
        'X-Idempotency-Key': existingKey || generateUUID(),
      },
    }
  }
}
