import { useNavigate, useSearchParams } from 'react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || 'tu correo'

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Card variant="glass" className="w-full max-w-md p-8 md:p-10 text-center">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📧</span>
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight mb-2">
          Verifica tu correo
        </h1>
        <p className="text-sm text-text-secondary mb-4">
          Hemos enviado un enlace de confirmación a <strong className="text-primary">{email}</strong>
        </p>
        <p className="text-sm text-text-secondary mb-6">
          Haz clic en el enlace del correo para activar tu cuenta. Una vez confirmado, podrás iniciar sesión.
        </p>
        <div className="space-y-3">
          <Button onClick={() => navigate('/login')} className="w-full">
            Ir al login
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
            Volver al inicio
          </Button>
        </div>
        <p className="mt-6 text-xs text-text-secondary">
          ¿No recibiste el correo? Revisa tu carpeta de spam o solicita un{' '}
          <button onClick={() => navigate('/register')} className="text-primary hover:underline">
            nuevo registro
          </button>
        </p>
      </Card>
    </section>
  )
}
