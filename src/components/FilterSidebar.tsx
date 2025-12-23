import type { HouseTheme } from '../context/AppContext'

interface FilterSidebarProps {
  selectedLocations: string[]
  setSelectedLocations: (locs: string[]) => void
  selectedThemes: string[]
  setSelectedThemes: (themes: string[]) => void
  priceRange: string
  setPriceRange: (value: string) => void
  duration: string
  setDuration: (value: string) => void
  capacity: number
  setCapacity: (value: number) => void
  status: string[]
  setStatus: (values: string[]) => void
  onClearAll: () => void
  className?: string
}

const locations = ['San Francisco', 'Los Angeles', 'Austin', 'New York', 'Miami', 'Seattle']

const themes: HouseTheme[] = ['AI', 'Climate', 'Hardware', 'Crypto', 'General Startup']

const themeColors: Record<HouseTheme, string> = {
  AI: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Climate: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  Hardware: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  Crypto: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  'General Startup': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
}

function FilterSidebar({
  selectedLocations,
  setSelectedLocations,
  selectedThemes,
  setSelectedThemes,
  priceRange,
  setPriceRange,
  duration,
  setDuration,
  capacity,
  setCapacity,
  status,
  setStatus,
  onClearAll,
  className = '',
}: FilterSidebarProps) {
  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      setSelectedLocations(selectedLocations.filter((l) => l !== loc))
    } else {
      setSelectedLocations([...selectedLocations, loc])
    }
  }

  const toggleTheme = (theme: HouseTheme) => {
    if (selectedThemes.includes(theme)) {
      setSelectedThemes(selectedThemes.filter((t) => t !== theme))
    } else {
      setSelectedThemes([...selectedThemes, theme])
    }
  }

  const toggleStatus = (stat: string) => {
    if (status.includes(stat)) {
      setStatus(status.filter((s) => s !== stat))
    } else {
      setStatus([...status, stat])
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Clear All Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
        <button
          onClick={onClearAll}
          className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Locations */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Locations</h4>
        <div className="space-y-2">
          {locations.map((loc) => (
            <label
              key={loc}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <input
                type="checkbox"
                checked={selectedLocations.includes(loc)}
                onChange={() => toggleLocation(loc)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span>{loc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Themes */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Themes</h4>
        <div className="space-y-2">
          {themes.map((theme) => (
            <label
              key={theme}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedThemes.includes(theme)}
                onChange={() => toggleTheme(theme)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${themeColors[theme]}`}
              >
                {theme}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Price</h4>
        <div className="space-y-2">
          {[
            { value: '', label: 'Any' },
            { value: 'under-500', label: 'Under $500' },
            { value: '500-1000', label: '$500 - $1,000' },
            { value: '1000-1500', label: '$1,000 - $1,500' },
            { value: '1500+', label: '$1,500+' },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <input
                type="radio"
                name="priceRange"
                value={option.value}
                checked={priceRange === option.value}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-4 h-4 border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Duration</h4>
        <div className="space-y-2">
          {[
            { value: '', label: 'Any' },
            { value: '1-3', label: '1-3 months' },
            { value: '3-6', label: '3-6 months' },
            { value: '6-12', label: '6-12 months' },
            { value: '12+', label: '12+ months' },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <input
                type="radio"
                name="duration"
                value={option.value}
                checked={duration === option.value}
                onChange={(e) => setDuration(e.target.value)}
                className="w-4 h-4 border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Capacity */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Capacity: {capacity}
        </h4>
        <input
          type="range"
          min="1"
          max="20"
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>1</span>
          <span>20</span>
        </div>
      </div>

      {/* Status */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Status</h4>
        <div className="space-y-2">
          {['Recruiting Now', 'Has Open Spots'].map((stat) => (
            <label
              key={stat}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <input
                type="checkbox"
                checked={status.includes(stat)}
                onChange={() => toggleStatus(stat)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span>{stat}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FilterSidebar
