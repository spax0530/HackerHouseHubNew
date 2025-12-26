import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

interface CityOption {
  city: string
  state: string
  stateCode: string
  displayName: string
}

interface CityStateAutocompleteProps {
  value: { city: string; state: string }
  onChange: (value: { city: string; state: string }) => void
  className?: string
}

// US State codes and names mapping
const US_STATES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
}

// Reverse mapping for state name to code
const STATE_NAME_TO_CODE: Record<string, string> = Object.entries(US_STATES).reduce(
  (acc, [code, name]) => {
    acc[name.toLowerCase()] = code
    return acc
  },
  {} as Record<string, string>
)

export function CityStateAutocomplete({ value, onChange, className = '' }: CityStateAutocompleteProps) {
  // Debug log to verify component is rendering
  console.log('CityStateAutocomplete rendering', { city: value.city, state: value.state })
  
  const [query, setQuery] = useState(value.city || '')
  const [suggestions, setSuggestions] = useState<CityOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const prevValueRef = useRef<string>(value.city || '')

  // Update query when value changes externally (e.g., when editing existing house)
  // Only update if the value actually changed from outside (not from our own onChange)
  useEffect(() => {
    if (value.city !== prevValueRef.current && value.city) {
      setQuery(value.city)
      prevValueRef.current = value.city
    }
  }, [value.city])

  // Debounce search
  useEffect(() => {
    const searchCities = async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      setError('')

      try {
        // Use Nominatim API with countrycode=us to restrict to US only
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery)}, United States&` +
          `format=json&` +
          `addressdetails=1&` +
          `limit=8&` +
          `countrycodes=us`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch cities')
        }

        const data = await response.json()

        // Parse results and filter for cities/towns in US
        const cityOptions: CityOption[] = data
          .filter((item: any) => {
            const address = item.address || {}
            // Must be a city/town/village in the US
            return (
              address.country_code === 'us' &&
              (address.city || address.town || address.village) &&
              address.state
            )
          })
          .map((item: any) => {
            const address = item.address || {}
            const cityName = address.city || address.town || address.village || ''
            const stateName = address.state || ''
            const stateCode = STATE_NAME_TO_CODE[stateName.toLowerCase()] || 
                             Object.keys(US_STATES).find(code => 
                               US_STATES[code].toLowerCase() === stateName.toLowerCase()
                             ) || 
                             stateName.substring(0, 2).toUpperCase()

            return {
              city: cityName,
              state: US_STATES[stateCode] || stateName,
              stateCode: stateCode,
              displayName: `${cityName}, ${stateCode}`
            }
          })
          .filter((option: CityOption, index: number, self: CityOption[]) =>
            // Remove duplicates based on city + state combination
            index === self.findIndex((o) => 
              o.city.toLowerCase() === option.city.toLowerCase() && 
              o.stateCode === option.stateCode
            )
          )
          .slice(0, 8) // Limit to 8 results

        setSuggestions(cityOptions)
      } catch (err) {
        console.error('Error searching cities:', err)
        setError('Failed to search cities. Please try again.')
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      if (query && query.length >= 2) {
        searchCities(query)
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Handle selection
  const handleSelect = (option: CityOption) => {
    setQuery(option.city)
    setSuggestions([])
    setShowSuggestions(false)
    setError('')
    onChange({ city: option.city, state: option.stateCode })
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    setShowSuggestions(true)
    setError('')

    // If user clears the input, clear the selected values
    if (!newValue) {
      onChange({ city: '', state: '' })
    }
  }

  // Handle blur - validate that city is selected
  const handleBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => {
      setShowSuggestions(false)
      // Note: We don't auto-select here to avoid forcing selections
      // User must explicitly select from dropdown
    }, 200)
  }

  // Handle focus
  const handleFocus = () => {
    if (query.length >= 2) {
      setShowSuggestions(true)
    }
  }

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search for a US city..."
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-auto"
        >
          {suggestions.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(option)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {option.city}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {option.state}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Display selected city and state */}
      {value.city && value.state && !showSuggestions && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Selected: {value.city}, {US_STATES[value.state] || value.state}
        </p>
      )}
    </div>
  )
}

