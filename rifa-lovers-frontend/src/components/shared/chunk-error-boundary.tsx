import { Component, type ReactNode, useEffect, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Detecta errores de carga de chunks (code splitting) y fuerza recarga.
 *
 * Este componente resuelve el problema común cuando:
 * 1. Se hace deploy con nuevos nombres de chunks (hash cambia)
 * 2. El usuario tiene la app abierta con referencias a chunks antiguos
 * 3. Al volver a la app, intenta cargar chunks que ya no existen
 *
 * Error típico: "Failed to fetch dynamically imported module: ...dashboard.page-xxx.js"
 */

function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  const message = error.message.toLowerCase()
  return (
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('dynamically imported module') ||
    message.includes('chunk load error') ||
    message.includes('loading chunk') ||
    // Import error en diferentes navegadores
    message.includes('importing script') ||
    message.includes('cannot find module')
  )
}

// Real React Error Boundary (class component) that catches render errors
class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    if (isChunkLoadError(error)) {
      console.warn('[ChunkErrorBoundary] Render error - chunk load:', error.message)
    } else {
      console.error('[ChunkErrorBoundary] Render error:', error)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export function ChunkErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)
  const [isChunkError, setIsChunkError] = useState(false)

  useEffect(() => {
    // Handler para errores de promesas no manejadas (errores de carga de chunks)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))

      if (isChunkLoadError(error)) {
        console.warn('[ChunkErrorBoundary] Detected chunk load error:', error.message)
        event.preventDefault()
        setIsChunkError(true)
        setHasError(true)

        // Auto-recarga después de 3 segundos si es chunk error
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
    }

    // Handler para errores de window
    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error)) {
        console.warn('[ChunkErrorBoundary] Window error - chunk load:', event.error?.message)
        event.preventDefault()
        setIsChunkError(true)
        setHasError(true)

        // Auto-recarga después de 3 segundos
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  const fallback = (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="size-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="size-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Actualizando aplicación
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Hemos publicado una nueva versión. Recargando automáticamente...
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="primary"
          className="gap-2"
        >
          <RefreshCw className="size-4" />
          Recargar ahora
        </Button>
      </div>
    </div>
  )

  if (hasError && isChunkError) {
    return fallback
  }

  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>
}

// Componente para usar como errorElement en rutas individuales
export function RouteErrorBoundary() {
  const error = (() => {
    try {
      // React Router v7 pasa el error en diferentes formas
      const err = (window as unknown as { __reactRouterError?: Error }).__reactRouterError
      return err
    } catch {
      return null
    }
  })()
  
  const isChunk = error ? isChunkLoadError(error) : false
  
  if (isChunk) {
    // Auto-recarga inmediata para chunk errors
    setTimeout(() => window.location.reload(), 100)
    
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="size-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <RefreshCw className="size-8 text-amber-600 animate-spin" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">
            Cargando actualización...
          </h1>
        </div>
      </div>
    )
  }

  // Error genérico
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Algo salió mal
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Ocurrió un error inesperado. Intenta recargar la página.
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="size-4" />
          Recargar página
        </Button>
      </div>
    </div>
  )
}
