import { Link } from 'react-router'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-bg-base">
      <div className="max-w-md">
        <p className="text-8xl font-extrabold gradient-text mb-4">404</p>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Página no encontrada</h1>
        <p className="text-text-secondary mb-8">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="primary" size="md">
              <Home className="size-4" />
              Ir al inicio
            </Button>
          </Link>
          <Button variant="secondary" size="md" onClick={() => window.history.back()}>
            <ArrowLeft className="size-4" />
            Volver atrás
          </Button>
        </div>
      </div>
    </div>
  )
}
