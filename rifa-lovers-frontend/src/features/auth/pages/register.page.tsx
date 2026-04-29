import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { UserPlus, Eye, EyeOff, Mail, Check, ShieldCheck } from 'lucide-react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { subscribeToNewsletter } from '@/api/newsletter.api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, clearError } = useAuthStore()

  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (password.length < 9) {
      toast.error('La contraseña debe tener al menos 9 caracteres')
      return
    }

    if (phone.length < 8) {
      toast.error('El teléfono debe tener al menos 8 dígitos. Ej: 56912345678')
      return
    }

    if (address && address.length < 10) {
      toast.error('La dirección debe tener al menos 10 caracteres')
      return
    }

    if (!acceptTerms) {
      toast.error('Debes aceptar los Términos y Condiciones para registrarte')
      return
    }

    if (!recaptchaToken) {
      toast.error('Por favor completa la verificación de seguridad (reCAPTCHA)')
      return
    }

    try {
      await register(name, lastName, phone, email, password, address || undefined, recaptchaToken, acceptTerms)

      // Auto-subscribe to newsletter if opted in
      if (subscribeNewsletter) {
        try {
          await subscribeToNewsletter(email.trim(), `${name} ${lastName}`.trim())
        } catch {
          // Silently ignore newsletter errors — registration is what matters
        }
      }

      // Redirect to email verification page - user must confirm email before accessing dashboard
      navigate(`/verificar-correo?email=${encodeURIComponent(email)}`)
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
            <p className="text-xs text-text-tertiary mt-1">Solo letras, sin números ni símbolos</p>
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
            <p className="text-xs text-text-tertiary mt-1">Solo letras, sin números ni símbolos</p>
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
            <p className="text-xs text-text-tertiary mt-1">Formato válido: ejemplo@correo.com</p>
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
            <p className="text-xs text-text-tertiary mt-1">Solo números, sin el signo +. Ej: 56912345678 (mínimo 8 dígitos)</p>
          </div>

          <div>
            <label htmlFor="register-address" className="block text-sm font-medium text-text-primary mb-1.5">
              Dirección de entrega
            </label>
            <input
              id="register-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Av. Las Condes 1234, Depto 501, Las Condes"
              className="w-full h-10 px-4 rounded-md border border-border bg-white text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <p className="text-xs text-amber-600 mt-1">🏆 Esta dirección será usada para entregarte el premio si resultas ganador. Mínimo 10 caracteres.</p>
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
                placeholder="Mínimo 9 caracteres"
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
            <p className="text-xs text-text-tertiary mt-1">Mínimo 9 caracteres. Usa letras, números o símbolos para mayor seguridad.</p>
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

          {/* Terms & Conditions */}
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="peer sr-only"
              />
              <div className="size-4.5 rounded border border-border bg-white peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-colors">
                <ShieldCheck className={`size-3 text-white transition-transform ${acceptTerms ? 'scale-100' : 'scale-0'}`} />
              </div>
            </div>
            <div className="flex-1">
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <ShieldCheck className="size-3 text-text-tertiary" />
                Acepto los <Link to="/terminos" target="_blank" className="text-primary hover:underline">Términos y Condiciones</Link> y la <Link to="/privacidad" target="_blank" className="text-primary hover:underline">Política de Privacidad</Link>.
              </span>
            </div>
          </label>

          {/* Newsletter opt-in */}
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={subscribeNewsletter}
                onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                className="peer sr-only"
              />
              <div className="size-4.5 rounded border border-border bg-white peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-colors">
                <Check className={`size-3 text-white transition-transform ${subscribeNewsletter ? 'scale-100' : 'scale-0'}`} />
              </div>
            </div>
            <div className="flex-1">
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Mail className="size-3 text-text-tertiary" />
                Suscribirme al newsletter para recibir noticias de ganadores, nuevas rifas y avisos importantes.
              </span>
            </div>
          </label>

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''}
              onChange={(token) => setRecaptchaToken(token)}
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
