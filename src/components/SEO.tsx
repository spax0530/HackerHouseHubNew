import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  structuredData?: object
  canonicalUrl?: string
  noindex?: boolean
}

const defaultTitle = 'HackerHouseHub - Find Your Perfect Hacker House'
const defaultDescription = 'Discover and connect with hacker houses, coliving spaces, and startup communities around the world. Find your perfect home for building the next big thing.'
const defaultImage = '/og-image.jpg'
const defaultUrl = 'https://hackerhousehub.com'

export default function SEO({
  title,
  description = defaultDescription,
  keywords,
  image = defaultImage,
  url = defaultUrl,
  type = 'website',
  structuredData,
  canonicalUrl,
  noindex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | HackerHouseHub` : defaultTitle
  const fullUrl = canonicalUrl || url
  const fullImage = image.startsWith('http') ? image : `${defaultUrl}${image}`

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* No Index */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="HackerHouseHub" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}

