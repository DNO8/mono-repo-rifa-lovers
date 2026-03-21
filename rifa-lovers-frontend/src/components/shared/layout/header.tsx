import { useState } from 'react'
import { Link } from 'react-router'
import { Menu, X, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NAV_ITEMS, SMILE_COUNT } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-light">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logos/logo-color.webp" alt="RifaLovers" className="h-8 w-auto" />
          <span className="font-bold text-lg text-text-primary">RifaLovers</span>
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
          <Badge variant="outline-primary" className="hidden sm:inline-flex animate-pulse-subtle">
            <Smile className="size-3.5" />
            +{SMILE_COUNT.toLocaleString('es-CL')} Sonrisas
          </Badge>
          <Button variant="primary" size="sm" className="hidden sm:inline-flex">
            Participar
          </Button>

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
          <div className="mt-2 px-4">
            <Button variant="primary" size="md" className="w-full">
              Participar
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
