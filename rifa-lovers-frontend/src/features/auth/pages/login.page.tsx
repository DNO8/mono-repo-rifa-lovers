import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'

  const { login, isLoading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()
    await login(email, password)
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) navigate(redirect)
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Card variant="glass" className="w-full max-w-md p-8 md:p-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/images/logos/logo-color.webp" alt="RifaLovers" className="h-8 w-auto" />
            <span className="font-bold text-xl text-text-primary">RifaLovers</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Inicia sesión
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Ingresa tus datos para continuar participando
          </p>
        </div>

        {error && (
          <div className="bg-error/10 text-error rounded-lg px-4 py-3 text-sm font-medium mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-text-primary mb-1.5">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full h-10 px-4 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-text-primary mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-4 pr-10 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={isLoading}>
            Iniciar sesión
            <LogIn className="size-4" />
          </Button>
        </form>

        <p className="text-sm text-text-secondary text-center mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-primary font-semibold hover:underline">
            Regístrate
          </Link>
        </p>
      </Card>
    </section>
  )
}
