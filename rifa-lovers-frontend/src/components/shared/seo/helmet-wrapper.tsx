import { Helmet } from 'react-helmet-async'

export interface SEOHeadProps {
  title: string
  description?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  canonical?: string
  noindex?: boolean
  keywords?: string
  ogUrl?: string
}

const SITE_NAME = 'RifaLovers'
const DEFAULT_DESCRIPTION =
  'RifaLovers — Rifas online con impacto social en Chile. Participa en sorteos legales y transparentes, gana premios increíbles y contribuye a causas solidarias. Comunidad participativa.'
const DEFAULT_OG_IMAGE = '/images/og/og-default.webp'
const SITE_URL = 'https://www.rifalovers.cl'

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonical,
  noindex = false,
  keywords,
  ogUrl,
}: SEOHeadProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined
  const ogAbsoluteUrl = ogUrl ? `${SITE_URL}${ogUrl}` : canonicalUrl ?? SITE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="RifaLovers SpA" />
      <meta name="theme-color" content="#7B3FE4" />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogAbsoluteUrl} />
      <meta property="og:image" content={`${SITE_URL}${ogImage}`} />
      <meta property="og:locale" content="es_CL" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}${ogImage}`} />
    </Helmet>
  )
}
