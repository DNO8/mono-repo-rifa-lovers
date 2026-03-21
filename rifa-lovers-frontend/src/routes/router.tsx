import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
import { PageLayout } from '@/components/shared/layout/page-layout'
import { Spinner } from '@/components/ui/spinner'

const LazyLandingPage = lazy(() => import('@/features/landing/pages/landing.page'))
const LazyImpactPage = lazy(() => import('@/features/impact/pages/impact.page'))
const LazyAboutPage = lazy(() => import('@/features/about/pages/about.page'))
const LazyContactPage = lazy(() => import('@/features/contact/pages/contact.page'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </d