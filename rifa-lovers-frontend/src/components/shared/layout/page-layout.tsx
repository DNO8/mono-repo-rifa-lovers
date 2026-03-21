import type { ReactNode } from 'react'
import { Header } from './header'
import { Footer } from './footer'
import { AuroraCanvas } from '@/components/shared/aurora-canvas'

interface PageLayoutProps {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <AuroraCanvas />
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </>
  )
}
