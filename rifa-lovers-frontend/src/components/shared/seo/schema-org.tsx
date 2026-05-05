import { Helmet } from 'react-helmet-async'
import {
  type OrganizationSchema,
  type WebSiteSchema,
  type FAQPageSchema,
} from './schema-org-constants'

interface SchemaOrgProps {
  organization?: OrganizationSchema
  website?: WebSiteSchema
  faqPage?: FAQPageSchema
}

function buildOrganizationSchema(data: OrganizationSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    sameAs: data.sameAs,
  }
}

function buildWebSiteSchema(data: WebSiteSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: data.searchUrl,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

function buildFAQPageSchema(data: FAQPageSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }
}

export function SchemaOrg({ organization, website, faqPage }: SchemaOrgProps) {
  const schemas: unknown[] = []

  if (organization) schemas.push(buildOrganizationSchema(organization))
  if (website) schemas.push(buildWebSiteSchema(website))
  if (faqPage) schemas.push(buildFAQPageSchema(faqPage))

  if (schemas.length === 0) return null

  return (
    <Helmet>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
