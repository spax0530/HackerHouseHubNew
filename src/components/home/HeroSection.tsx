import { useNavigate } from 'react-router-dom'
import SearchBar from '../SearchBar'

function HeroSection() {
  const navigate = useNavigate()

  const handleSearch = (values: {
    location: string
    theme: string
    priceRange: string
    duration: string
  }) => {
    // Build query parameters
    const params = new URLSearchParams()
    if (values.location) {
      params.set('location', values.location)
    }
    if (values.theme) {
      params.set('theme', values.theme)
    }
    if (values.priceRange) {
      params.set('priceRange', values.priceRange)
    }
    if (values.duration) {
      params.set('duration', values.duration)
    }

    // Navigate to search page with query params
    navigate(`/search?${params.toString()}`)
  }

  return (
    <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-white dark:to-slate-950 pt-28 pb-36 md:pt-36 md:pb-48">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <span className="text-xs font-medium text-blue-400">Join builders and hosts nationwide</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 max-w-4xl mx-auto leading-tight">
            Find a Hacker House Anywhere in the U.S.
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Live with builders. Join a residency. Build together. Find your next hacker house in top tech cities across America.
          </p>

          {/* Hero Search Bar */}
          <div className="max-w-5xl mx-auto">
            <SearchBar variant="hero" onSubmit={handleSearch} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
