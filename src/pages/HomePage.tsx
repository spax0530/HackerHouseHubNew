import HeroSection from '../components/home/HeroSection'
import FeaturesSection from '../components/home/FeaturesSection'
import TrustedBy from '../components/home/TrustedBy'
import FeaturedHousesSection from '../components/home/FeaturedHousesSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import ExploreCitiesSection from '../components/home/ExploreCitiesSection'
import CtaSection from '../components/home/CtaSection'

function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <TrustedBy />
      <FeaturedHousesSection />
      <TestimonialsSection />
      <ExploreCitiesSection />
      <CtaSection />
    </div>
  )
}

export default HomePage
