/**
 * Logging Decorator — logs request/response info for debugging.
 * Wraps any HttpClient without modifying the original implementation.
 */

import type { HttpClient, HttpRequestOptions } from './http-client'

export class LoggingDecorator implements HttpClient {
  constructor(
    private client: HttpClient,
    private prefix: string = '[api]',
  ) {}

  async get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.withLogging('GET', path, () => this.client.get<T>(path, options))
  }

  async post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.withLogging('POST', path, () => this.client.post<T>(path, body, options))
  }

  async put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.withLogging('PUT', path, () => this.client.put<T>(path, body, options))
  }

  async delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.withLogging('DELETE', path, () => this.client.delete<T>(path, options))
  }

  private async withLogging<T>(method: string, path: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const ms = (performance.now() - start).toFixed(1)
      console.info(`${this.prefix} ${method} ${path} — ${ms}ms`)
      return result
    } catch (error) {
      const ms = (performance.now() - start).toFixed(1)
      console.error(`${this.prefix} ${method} ${path} — FAILED ${ms}ms`, error)
      throw error
    }
  }
}
