/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { PageWithSuspense } from './route-wrappers'

const LazyLandingPage = lazy(() => import('@/features/landing/pages/landing.page'))
const LazyImpactPage = lazy(() => import('@/features/impact/pages/impact.page'))
const LazyAboutPage = lazy(() => import('@/features/about/pages/about.page'))
const LazyContactPage = lazy(() => import('@/features/contact/pages/contact.page'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PageWithSuspense>
        <LazyLandingPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/impacto',
    element: (
      <PageWithSuspense>
        <LazyImpactPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/nosotros',
    element: (
      <PageWithSuspense>
        <LazyAboutPage />
      </PageWithSuspense>
    ),
  },
  {
    path: '/contacto',
    element: (
      <PageWithSuspense>
        <LazyContactPage />
      </PageWithSuspense>
    ),
  },
])
