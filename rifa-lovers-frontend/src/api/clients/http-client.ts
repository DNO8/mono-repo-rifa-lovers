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
  patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>
  delete<T>(path: string, options?: HttpRequestOptions): Promise<T>
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    statusText: string,
    public readonly body?: unknown,
  ) {
    super(`API ${status}: ${statusText}`)
    this.name = 'ApiError'
  }

  private serverMessage(): string | undefined {
    const body = this.body as Record<string, unknown> | null
    if (!body) return undefined
    const msg = body.message
    if (typeof msg === 'string') return msg
    if (Array.isArray(msg)) return msg[0] as string
    return undefined
  }

  getUserMessage(context?: 'auth' | 'payment' | 'general'): string {
    if (this.status === 429) {
      return 'Has realizado demasiadas solicitudes. Por favor espera un momento e intenta de nuevo.'
    }
    if (this.status >= 500) {
      return 'Hubo un problema con el servidor. Por favor intenta más tarde.'
    }

    if (context === 'auth') {
      if (this.status === 400 || this.status === 401) return 'El correo o la contraseña son incorrectos. Verifica tus datos e intenta de nuevo.'
      if (this.status === 403) return 'Tu cuenta no tiene permiso para realizar esta acción.'
      if (this.status === 409) return 'Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión.'
    }

    if (context === 'payment') {
      if (this.status === 400 || this.status === 402) return 'No se pudo procesar el pago. Verifica los datos de tu tarjeta e intenta de nuevo.'
      if (this.status === 404) return 'No se encontró la compra asociada. Por favor contacta soporte.'
      if (this.status === 409) return 'Esta compra ya fue procesada anteriormente.'
    }

    if (this.status === 401) return 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
    if (this.status === 403) return 'No tienes permiso para realizar esta acción.'
    if (this.status === 404) return 'El recurso solicitado no fue encontrado.'
    if (this.status === 409) return 'Ya existe un registro con estos datos.'
    if (this.status === 422) return this.serverMessage() ?? 'Los datos ingresados no son válidos. Revísalos e intenta de nuevo.'

    return this.serverMessage() ?? 'Ocurrió un error inesperado. Por favor intenta más tarde.'
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

  async patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body, ...options })
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
