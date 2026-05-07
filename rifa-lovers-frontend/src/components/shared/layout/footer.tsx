import { Link, useNavigate, useLocation } from 'react-router'
import { NAV_ITEMS } from '@/lib/constants'
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'

function NavLink({ href, onClick, children }: { href: string; onClick?: (e: React.MouseEvent) => void; children: React.ReactNode }) {
  return (
    <Link to={href} onClick={onClick} className="text-xs text-text-secondary hover:text-primary transition-colors py-1.5 inline-block">
      {children}
    </Link>
  )
}

const LEGAL_LINKS = [
  { label: 'Bases Legales', href: '/bases-legales' },
  { label: 'Términos y Condiciones', href: '/terminos' },
  { label: 'Política de Privacidad', href: '/privacidad' },
]

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61572258592880', icon: FaFacebook, color: '#1877F2' },
  { label: 'Instagram', href: 'https://www.instagram.com/rifalovers_cl/', icon: FaInstagram, color: '#E4405F' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@rifalovers_cl', icon: FaTiktok, color: '#000000' },
]

function SocialLinks() {
  return (
    <div>
      <h2 className="font-semibold text-text-primary text-xs uppercase tracking-wide mb-2">Comunidad</h2>
      <p className="text-xs text-text-secondary mb-2.5">
        Síguenos y únete a nuestra comunidad en redes sociales.
      </p>
      <ul className="space-y-1.5">
        {SOCIAL_LINKS.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors py-1.5"
            >
              <item.icon className="size-3.5" style={{ color: item.color }} />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    const hashIndex = href.indexOf('#')
    if (hashIndex === -1) return

    e.preventDefault()
    const hash = href.slice(hashIndex + 1)
    const basePath = href.slice(0, hashIndex) || '/'

    const scrollTo = () => {
      const el = document.getElementById(hash)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    if (location.pathname === basePath) {
      scrollTo()
    } else {
      navigate(basePath)
      setTimeout(scrollTo, 100)
    }
  }

  return (
    <footer className="bg-bg-muted border-t border-border-light">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-2">
              <img src="/images/logos/logo-v2.webp" alt="RifaLovers" width="55" height="24" className="h-6 w-auto" />
              <span className="text-base gradient-text leading-none" style={{ fontFamily: "'Montserrat Variable', 'Montserrat', sans-serif" }}><span className="font-bold">Rifa</span><span className="font-semibold">Lovers</span></span>
            </Link>
            <p className="text-xs text-text-secondary max-w-[220px]" style={{ fontFamily: "'Montserrat Variable', 'Montserrat', sans-serif", fontWeight: 400 }}>
              Experiencias reales. Comunidad real. Transparencia real.Transparencia real.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h2 className="font-semibold text-text-primary text-xs uppercase tracking-wide mb-2">Navegación</h2>
            <ul className="space-y-1.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} onClick={(e) => handleNavClick(e, item.href)}>{item.label}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h2 className="font-semibold text-text-primary text-xs uppercase tracking-wide mb-2">Legal</h2>
            <ul className="space-y-1.5">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-xs text-text-secondary hover:text-primary transition-colors py-1.5 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <SocialLinks />
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
