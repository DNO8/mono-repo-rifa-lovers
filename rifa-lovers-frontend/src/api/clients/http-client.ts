/**
 * HttpClient interface + base FetchHttpClient implementation.
 * Decorators wrap this interface to add cross-cutting concerns
 * (auth, logging, retry, etc.) without modifying the core client.
 */

import { API_BASE_URL } from '@/lib/env'

export interface HttpRequestOptions {
  headers?: Record<string, string>
  body?: unknown
  signal?: AbortSignal
}

export interface HttpClient {
  get<T>(path: string, options?: HttpRequestOptions): Promise<T>
  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>
  put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>
  delete<T>(path: string, options?: HttpRequestOptions): Promise<T>
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: unknown,
  ) {
    super(`API ${status}: ${statusText}`)
    this.name = 'ApiError'
  }
}

export class FetchHttpClient implements HttpClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(path, { method: 'GET', ...options })
  }

  async post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(path, { method: 'POST', body, ...options })
  }

  async put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body, ...options })
  }

  async delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', ...options })
  }

  private async request<T>(
    path: string,
    options: HttpRequestOptions & { method: string },
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new ApiError(res.status, res.statusText, body)
    }

    if (res.status === 204) return undefined as T

    return res.json() as Promise<T>
  }
}
