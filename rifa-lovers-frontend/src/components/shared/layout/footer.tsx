import { Link } from 'react-router'
import { NAV_ITEMS } from '@/lib/constants'

const LEGAL_LINKS = [
  { label: 'Bases Legales', href: '/bases-legales' },
  { label: 'Términos y Condiciones', href: '/terminos' },
  { label: 'Política de Privacidad', href: '/privacidad' },
]

export function Footer() {
  return (
    <footer className="bg-bg-muted border-t border-border-light">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-2">
              <img src="/images/logos/logo-v2.webp" alt="RifaLovers" className="h-6 w-auto" />
              <span className="text-base gradient-text leading-none" style={{ fontFamily: 'Montserrat, sans-serif' }}><span className="font-bold">Rifa</span><span className="font-semibold">Lovers</span></span>
            </Link>
            <p className="text-xs text-text-secondary max-w-[220px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
              Tu suerte crea impacto real. Participa, gana y transforma vidas.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wide mb-2">Navegación</h4>
            <ul className="space-y-1.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-xs text-text-secondary hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wide mb-2">Legal</h4>
            <ul className="space-y-1.5">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-xs text-text-secondary hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-text-primary text-xs uppercase tracking-wide mb-2">Comunidad</h4>
            <p className="text-xs text-text-secondary">
              Únete a nuestra comunidad y sé parte del cambio.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-5 pt-4 border-t border-border-light flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-[11px] text-text-tertiary">
            © {new Date().getFullYear()} RifaLovers SpA · Marca registrada ®. Todos los derechos reservados.
          </p>
          <p className="text-[10px] text-text-tertiary/70">
            Respaldo legal: KRIM Consultores · Tecnología: Innovaxchain
          </p>
        </div>
      </div>
    </footer>
  )
}
