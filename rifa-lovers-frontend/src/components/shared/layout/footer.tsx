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
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src="/images/logos/logo-v2.webp" alt="RifaLovers" className="h-7 w-auto" />
              <span className="text-lg gradient-text leading-none" style={{ fontFamily: 'Montserrat, sans-serif' }}><span className="font-bold">Rifa</span><span className="font-semibold"> Lovers</span></span>
            </Link>
            <p className="text-sm text-text-secondary max-w-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
              Tu suerte crea impacto real. Participa, gana y transforma vidas.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-text-primary text-sm mb-3">Navegación</h4>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-text-primary text-sm mb-3">Legal</h4>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-text-primary text-sm mb-3">Comunidad</h4>
            <p className="text-sm text-text-secondary">
              Únete a nuestra comunidad y sé parte del cambio.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border-light text-center space-y-2">
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} Rifa Lovers SpA · Marca registrada ®. Todos los derechos reservados.
          </p>
          <p className="text-[10px] text-text-tertiary/70">
            Respaldo legal: KRIM Consultores · Tecnología: Innovaxchain
          </p>
        </div>
      </div>
    </footer>
  )
}
