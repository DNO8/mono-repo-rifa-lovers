import { useState } from 'react'
import { Link } from 'react-router'
import { SEOHead } from '@/components/shared/seo/helmet-wrapper'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import { toast } from 'react-toastify'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await apiClient.post(ENDPOINTS.auth.forgotPassword, { email })
      setIsSubmitted(true)
      toast.success('Email de recuperación enviado')
    } catch {
      toast.error('Error al enviar el email. Intenta más tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <>
        <SEOHead title="Recuperar contraseña" noindex />
        <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <Card variant="glass" className="w-full max-w-md p-8 md:p-10 text-center">
          <div className="size-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="size-8 text-success" />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight mb-2">
            ¡Revisa tu email!
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
            Sigue las instrucciones para restablecer tu contraseña.
          </p>
          <Link to="/login">
            <Button variant="outline" size="lg" className="w-full">
              <ArrowLeft className="size-4 mr-2" />
              Volver al login
            </Button>
          </Link>
        </Card>
      </section>
      </>
    )
  }

  return (
    <>
      <SEOHead title="Recuperar contraseña" noindex />
      <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Card variant="glass" className="w-full max-w-md p-8 md:p-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/images/logos/logo-v2.webp" alt="RifaLovers" className="h-8 w-auto" />
            <span className="text-xl gradient-text leading-none" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <span className="font-bold">Rifa</span><span className="font-semibold"> Lovers</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Ingresa tu email y te enviaremos un enlace para restablecerla
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-text-primary mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full h-10 px-4 pl-10 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={isLoading}>
            Enviar enlace de recuperación
          </Button>
        </form>

        <p className="text-sm text-text-secondary text-center mt-6">
          <Link to="/login" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="size-4" />
            Volver al login
          </Link>
        </p>
      </Card>
    </section>
    </>
  )
}
