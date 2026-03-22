import { useState } from 'react'
import { Link } from 'react-router'
import { Menu, X, Smile, User, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NAV_ITEMS, SMILE_COUNT } from '@/lib/constants'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex flex-col lg:flex-row items-center gap-0.5 lg:gap-2">
          <img src="/images/logos/logo-color.webp" alt="RifaLovers" className="h-6 lg:h-8 w-auto" />
          <span className="font-bold text-xs lg:text-lg text-text-primary">RifaLovers</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col lg:flex-row items-end lg:items-center gap-0.2 lg:gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="secondary" size="sm">
                  <User className="size-3.5" />
                  Mi cuenta
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm">
                  <LogIn className="size-3.5" />
                  Ingresar
                </Button>
              </Link>
            )}
            <Badge variant="outline-primary" className="animate-pulse-subtle scale-75 lg:scale-100 origin-right">
              <Smile className="size-3.5" />
              +{SMILE_COUNT.toLocaleString('es-CL')} Sonrisas
            </Badge>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-text-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-out glass-light border-t border-border-light',
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="rounded-md px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-purple-soft hover:text-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 px-4 space-y-2">
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" size="md" className="w-full">
                  <User className="size-4" />
                  Mi cuenta
                </Button>
              </Link>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="md" className="w-full">
                  <LogIn className="size-4" />
                  Ingresar
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
