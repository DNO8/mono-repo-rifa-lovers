/**
 * Refresh Decorator — intercepts 401 responses, refreshes the JWT token
 * via Supabase's /auth/refresh endpoint, updates the store, and retries
 * the original request once.
 */

import type { HttpClient, HttpRequestOptions } from './http-client'
import { ApiError, FetchHttpClient } from './http-client'
import { ENDPOINTS } from '../endpoints'

type TokenStore = {
  getRefreshToken: () => string | null
  setToken: (token: string) => void
  logout: () => void
}

const defaultTokenStore: TokenStore = {
  getRefreshToken: () => {
    try {
      const raw = localStorage.getItem('auth-storage')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed?.state?.refreshToken ?? null
    } catch {
      return null
    }
  },
  setToken: (token: string) => {
    try {
      const raw = localStorage.getItem('auth-storage')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.state) {
        parsed.state.token = token
        localStorage.setItem('auth-storage', JSON.stringify(parsed))
      }
    } catch {
      // silent
    }
  },
  logout: () => {
    try {
      const raw = localStorage.getItem('auth-storage')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.state) {
        parsed.state.token = null
        parsed.state.refreshToken = null
        parsed.state.isAuthenticated = false
        parsed.state.user = null
        localStorage.setItem('auth-storage', JSON.stringify(parsed))
      }
    } catch {
      // silent
    }
  },
}

export class RefreshDecorator implements HttpClient {
  private isRefreshing = false
  private refreshPromise: Promise<string | null> | null = null

  constructor(
    private client: HttpClient,
    private store: TokenStore = defaultTokenStore,
  ) {}

  async get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.withRefresh(() => this.client.get<T>(path, options), path)
  }

  async post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.withRefresh(() => this.client.post<T>(path, body, options), path)
  }

  async put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.withRefresh(() => this.client.put<T>(path, body, options), path)
  }

  async delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.withRefresh(() => this.client.delete<T>(path, options), path)
  }

  private async withRefresh<T>(
    fn: () => Promise<T>,
    _path: string,
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error
      }

      // Don't try to refresh auth endpoints themselves
      if (_path.startsWith('/auth/')) {
        throw error
      }

      const newToken = await this.tryRefresh()
      if (!newToken) {
        this.store.logout()
        throw error
      }

      // Retry the original request (AuthDecorator will pick up the new token from localStorage)
      return fn()
    }
  }

  private async tryRefresh(): Promise<string | null> {
    // Deduplicate concurrent refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.store.getRefreshToken()
    if (!refreshToken) return null

    this.isRefreshing = true
    this.refreshPromise = this.doRefresh(refreshToken)

    try {
      return await this.refreshPromise
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async doRefresh(refreshToken: string): Promise<string | null> {
    try {
      // Use a bare FetchHttpClient to avoid infinite loops through the decorator chain
      const bareClient = new FetchHttpClient()
      const data = await bareClient.post<{ accessToken: string }>(
        ENDPOINTS.auth.refresh,
        { refreshToken },
      )

      if (data.accessToken) {
        this.store.setToken(data.accessToken)
        return data.accessToken
      }

      return null
    } catch {
      return null
    }
  }
}
