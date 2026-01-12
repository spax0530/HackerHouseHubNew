import HeroSection from '../components/home/HeroSection'
import FeaturesSection from '../components/home/FeaturesSection'
import TrustedBy from '../components/home/TrustedBy'
import FeaturedHousesSection from '../components/home/FeaturedHousesSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import ExploreCitiesSection from '../components/home/ExploreCitiesSection'
import CtaSection from '../components/home/CtaSection'
import SEO from '../components/SEO'

const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HackerHouseHub',
  description: 'Platform connecting builders with hacker houses and startup communities worldwide',
  url: 'https://hackerhousehub.com',
  logo: 'https://hackerhousehub.com/logo.png',
  sameAs: [
    // Add social media links here when available
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    url: 'https://hackerhousehub.com/contact',
  },
}

function HomePage() {
  return (
    <>
      <SEO
        title="Find Your Perfect Hacker House"
        description="Discover and connect with hacker houses, coliving spaces, and startup communities around the world. Join a community of builders, creators, and entrepreneurs."
        keywords="hacker house, coliving, startup community, tech house, entrepreneur housing, developer house, AI house, crypto house, startup hub"
        structuredData={organizationStructuredData}
      />
      <div className="overflow-x-hidden">
        <HeroSection />
        <FeaturesSection />
        <TrustedBy />
        <FeaturedHousesSection />
        <TestimonialsSection />
        <ExploreCitiesSection />
        <CtaSection />
      </div>
    </>
  )
}

export default HomePage
