const SITE_URL = 'https://www.rifalovers.cl'

export interface OrganizationSchema {
  name: string
  url: string
  logo: string
  description: string
  sameAs: string[]
}

export interface WebSiteSchema {
  name: string
  url: string
  searchUrl: string
}

export interface FAQPageSchema {
  questions: { question: string; answer: string }[]
}

export const DEFAULT_ORGANIZATION: OrganizationSchema = {
  name: 'RifaLovers SpA',
  url: SITE_URL,
  logo: `${SITE_URL}/images/logos/logo-v2.webp`,
  description:
    'RifaLovers — Rifas online con impacto social en Chile. Sorteos legales y transparentes donde participar significa contribuir a causas solidarias.',
  sameAs: [
    'https://www.facebook.com/profile.php?id=61572258592880',
    'https://www.instagram.com/rifalovers_cl/',
    'https://www.tiktok.com/@rifalovers_cl',
  ],
}

export const DEFAULT_WEBSITE: WebSiteSchema = {
  name: 'RifaLovers',
  url: SITE_URL,
  searchUrl: `${SITE_URL}/?search={search_term_string}`,
}
