import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, clearError } = useAuthStore()

  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      await register(name, lastName, phone, email, password)
      const { isAuthenticated } = useAuthStore.getState()
      if (isAuthenticated) navigate('/dashboard')
    } catch {
      // Error ya mostrado por auth store
    }
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Card variant="glass" className="w-full max-w-md p-8 md:p-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/images/logos/logo-v2.webp" alt="RifaLovers" className="h-8 w-auto" />
            <span className="text-xl gradient-text leading-none" style={{ fontFamily: 'Montserrat, sans-serif' }}><span className="font-bold">Rifa</span><span className="font-semibold"> Lovers</span></span>
          </Link>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Crea tu cuenta
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Únete y empieza a participar con impacto real
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="block text-sm font-medium text-text-primary mb-1.5">
              Nombre
            </label>
            <input
              id="register-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full h-10 px-4 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label htmlFor="register-lastName" className="block text-sm font-medium text-text-primary mb-1.5">
              Apellido
            </label>
            <input
              id="register-lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Tu apellido"
              className="w-full h-10 px-4 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-text-primary mb-1.5">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full h-10 px-4 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label htmlFor="register-phone" className="block text-sm font-medium text-text-primary mb-1.5">
              Teléfono
            </label>
            <input
              id="register-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={11}
              placeholder="56912345678 (sin el +)"
              className="w-full h-10 px-4 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <p className="text-xs text-text-tertiary mt-1">Solo números, sin el signo +</p>
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-text-primary mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
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

          <div>
            <label htmlFor="register-confirm" className="block text-sm font-medium text-text-primary mb-1.5">
              Confirmar contraseña
            </label>
            <input
              id="register-confirm"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="w-full h-10 px-4 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={isLoading}>
            Crear cuenta
            <UserPlus className="size-4" />
          </Button>
        </form>

        <p className="text-sm text-text-secondary text-center mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </section>
  )
}
