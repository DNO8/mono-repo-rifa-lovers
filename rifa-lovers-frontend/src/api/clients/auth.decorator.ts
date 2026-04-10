/**
 * Auth Decorator — injects Bearer token from persisted auth storage.
 * Wraps any HttpClient without modifying the original implementation.
 */

import type { HttpClient, HttpRequestOptions } from './http-client'

type TokenProvider = () => string | null

const defaultTokenProvider: TokenProvider = () => {
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.token ?? null
  } catch {
    return null
  }
}

export class AuthDecorator implements HttpClient {
  constructor(
    private client: HttpClient,
    private getToken: TokenProvider = defaultTokenProvider,
  ) {}

  async get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.client.get<T>(path, this.injectAuth(options))
  }

  async post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.client.post<T>(path, body, this.injectAuth(options))
  }

  async put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.client.put<T>(path, body, this.injectAuth(options))
  }

  async delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.client.delete<T>(path, this.injectAuth(options))
  }

  private injectAuth(options?: HttpRequestOptions): HttpRequestOptions {
    const token = this.getToken()
    if (!token) return options ?? {}
    return {
      ...options,
      headers: {
        ...(options?.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    }
  }
}
