import { useState } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  variant?: 'hero' | 'compact'
  onSubmit?: (values: {
    location: string
    theme: string
    priceRange: string
    duration: string
  }) => void
}

function SearchBar({ variant = 'hero', onSubmit }: SearchBarProps) {
  const [location, setLocation] = useState('')
  const [theme, setTheme] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [duration, setDuration] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const values = {
      location,
      theme,
      priceRange,
      duration,
    }
    if (onSubmit) {
      onSubmit(values)
    } else {
      console.log('Search values:', values)
    }
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by location or theme..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">All Themes</option>
          <option value="AI">AI</option>
          <option value="Climate">Climate</option>
          <option value="Hardware">Hardware</option>
          <option value="Crypto">Crypto</option>
          <option value="General Startup">General Startup</option>
        </select>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm"
        >
          Search
        </button>
      </form>
    )
  }

  // Hero variant
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-800"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Location
          </label>
          <input
            type="text"
            placeholder="City or state"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Theme */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Any Theme</option>
            <option value="AI">AI</option>
            <option value="Climate">Climate</option>
            <option value="Hardware">Hardware</option>
            <option value="Crypto">Crypto</option>
            <option value="General Startup">General Startup</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Price Range
          </label>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Any Price</option>
            <option value="under-500">Under $500</option>
            <option value="500-1000">$500 - $1,000</option>
            <option value="1000-1500">$1,000 - $1,500</option>
            <option value="1500+">$1,500+</option>
          </select>
        </div>

        {/* Duration */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Any Duration</option>
            <option value="1-3">1-3 months</option>
            <option value="3-6">3-6 months</option>
            <option value="6-12">6-12 months</option>
            <option value="12+">12+ months</option>
          </select>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-6">
        <button
          type="submit"
          className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm md:text-base"
        >
          Search Houses
        </button>
      </div>
    </form>
  )
}

export default SearchBar
