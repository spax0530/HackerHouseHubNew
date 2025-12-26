import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Grid, Map } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import FilterSidebar from '../components/FilterSidebar'
import FilterDrawer from '../components/FilterDrawer'
import HouseCard from '../components/HouseCard'
import MapView from '../components/MapView'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import { HouseCardSkeleton } from '../components/LoadingSkeleton'
import type { HouseTheme } from '../context/AppContext'
import { supabase, type House } from '../lib/supabase'

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'newest'
type ViewMode = 'grid' | 'map'

const ITEMS_PER_PAGE = 9

function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState('')
  const [duration, setDuration] = useState('')
  const [capacity, setCapacity] = useState(1)
  const [status, setStatus] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  
  // New state for real data
  const [houses, setHouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Initialize filters from URL params
  useEffect(() => {
    const location = searchParams.get('location')
    const theme = searchParams.get('theme')
    const priceRangeParam = searchParams.get('priceRange')
    const durationParam = searchParams.get('duration')

    if (location) {
      setSelectedLocations([location])
    }
    if (theme) {
      setSelectedThemes([theme as HouseTheme])
    }
    if (priceRangeParam) {
      setPriceRange(priceRangeParam)
    }
    if (durationParam) {
      setDuration(durationParam)
    }
  }, [searchParams])

  // Fetch houses from Supabase
  const fetchHouses = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .eq('admin_status', 'approved') // Only show approved houses
        
      if (error) throw error

      if (data) {
          const formatted = data.map((h: House) => ({
            id: h.id,
            slug: h.slug, // SEO-friendly slug
            name: h.name,
            city: h.city,
            state: h.state,
            theme: h.theme as HouseTheme,
            price: `$${h.price_per_month}/mo`,
            pricePerMonth: h.price_per_month,
            duration: h.duration,
            // Map duration string to simple value if needed for legacy filters
            // e.g. "3-6 months" -> "3-6"
            durationValue: h.duration.replace(' months', '').replace(' month', '').replace('+', '').replace('–', '-').trim(),
            capacity: h.capacity,
            status: h.status,
            image: h.images?.[0] || '', 
            images: h.images || [],
            // Add other fields if needed by HouseCard or filters
          }))
        setHouses(formatted)
      }
    } catch (error) {
      console.error('Error fetching houses:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHouses()

    // Set up real-time subscription for new houses
    const channel = supabase
      .channel('search-houses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'houses',
          filter: 'admin_status=eq.approved',
        },
        () => {
          // Refetch when houses change
          fetchHouses()
        }
      )
      .subscribe()

    // Also refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchHouses()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      channel.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchHouses])

  // Filter logic
  const filteredHouses = useMemo(() => {
    return houses.filter((house) => {
      // Location filter
      if (selectedLocations.length > 0) {
        const houseLocation = `${house.city}, ${house.state}`.toLowerCase()
        if (
          !selectedLocations.some(
            (loc) =>
              houseLocation.includes(loc.toLowerCase()) ||
              house.city.toLowerCase().includes(loc.toLowerCase()) ||
              house.state.toLowerCase().includes(loc.toLowerCase())
          )
        ) {
          return false
        }
      }

      // Theme filter
      if (selectedThemes.length > 0) {
        if (!selectedThemes.includes(house.theme)) {
          return false
        }
      }

      // Price filter
      if (priceRange) {
        const price = house.pricePerMonth || 0
        switch (priceRange) {
          case 'under-500':
            if (price >= 500) return false
            break
          case '500-1000':
            if (price < 500 || price > 1000) return false
            break
          case '1000-1500':
            if (price < 1000 || price > 1500) return false
            break
          case '1500+':
            if (price < 1500) return false
            break
        }
      }

      // Duration filter
      if (duration && house.durationValue !== duration) {
        // Approximate check if strict match fails
        if (!house.duration.includes(duration)) {
             return false
        }
      }

      // Capacity filter
      if (house.capacity && house.capacity < capacity) {
        return false
      }

      // Status filter
      if (status.length > 0) {
        if (status.includes('Recruiting Now') && house.status !== 'Recruiting Now') {
          if (!status.includes('Has Open Spots')) return false
        }
        if (status.includes('Has Open Spots') && house.status === 'Full') {
          return false
        }
      }

      return true
    })
  }, [houses, selectedLocations, selectedThemes, priceRange, duration, capacity, status])

  // Sort logic
  const sortedHouses = useMemo(() => {
    const h = [...filteredHouses]
    switch (sortBy) {
      case 'price-low':
        return h.sort((a, b) => (a.pricePerMonth || 0) - (b.pricePerMonth || 0))
      case 'price-high':
        return h.sort((a, b) => (b.pricePerMonth || 0) - (a.pricePerMonth || 0))
      case 'newest':
        return h.sort((a, b) => b.id - a.id)
      default:
        return h
    }
  }, [filteredHouses, sortBy])

  // Pagination
  const totalPages = Math.ceil(sortedHouses.length / ITEMS_PER_PAGE)
  const paginatedHouses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedHouses.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedHouses, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedLocations, selectedThemes, priceRange, duration, capacity, status, sortBy])

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const handleClearAll = () => {
    setSelectedLocations([])
    setSelectedThemes([])
    setPriceRange('')
    setDuration('')
    setCapacity(1)
    setStatus([])
  }

  const handleSearch = (values: {
    location: string
    theme: string
    priceRange: string
    duration: string
  }) => {
    if (values.location) {
      setSelectedLocations([values.location])
    }
    if (values.theme) {
      setSelectedThemes([values.theme as HouseTheme])
    }
    if (values.priceRange) {
      setPriceRange(values.priceRange)
    }
    if (values.duration) {
      setDuration(values.duration)
    }
  }

  // Get active filters for display
  const activeFilters = useMemo(() => {
    const filters: string[] = []
    if (selectedLocations.length > 0) {
      filters.push(...selectedLocations)
    }
    if (selectedThemes.length > 0) {
      filters.push(...selectedThemes)
    }
    if (priceRange) {
      const priceLabels: Record<string, string> = {
        'under-500': '< $500/mo',
        '500-1000': '$500-1000/mo',
        '1000-1500': '$1000-1500/mo',
        '1500+': '$1500+/mo',
      }
      filters.push(priceLabels[priceRange] || priceRange)
    }
    if (duration) {
      const durationLabels: Record<string, string> = {
        '1-3': '1-3 months',
        '3-6': '3-6 months',
        '6-12': '6-12 months',
        '12+': '12+ months',
      }
      filters.push(durationLabels[duration] || duration)
    }
    if (capacity > 1) {
      filters.push(`Min ${capacity} residents`)
    }
    if (status.length > 0) {
      filters.push(...status)
    }
    return filters
  }, [selectedLocations, selectedThemes, priceRange, duration, capacity, status])

  const hasActiveFilters = useMemo(() => {
    return (
      selectedLocations.length > 0 ||
      selectedThemes.length > 0 ||
      priceRange !== '' ||
      duration !== '' ||
      capacity > 1 ||
      status.length > 0
    )
  }, [selectedLocations, selectedThemes, priceRange, duration, capacity, status])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBar variant="compact" onSubmit={handleSearch} />
            </div>
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Filter size={18} />
              <span className="text-sm font-medium">Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Filter Sidebar (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 h-fit">
              <div className="bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 pr-6">
                <FilterSidebar
                  selectedLocations={selectedLocations}
                  setSelectedLocations={setSelectedLocations}
                  selectedThemes={selectedThemes}
                  setSelectedThemes={setSelectedThemes}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  duration={duration}
                  setDuration={setDuration}
                  capacity={capacity}
                  setCapacity={setCapacity}
                  status={status}
                  setStatus={setStatus}
                  onClearAll={handleClearAll}
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {sortedHouses.length} {sortedHouses.length === 1 ? 'house' : 'houses'} found
                    </h1>
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearAll}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {activeFilters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>
                      {activeFilters.map((filter, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        >
                          {filter}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="price-low">Sort by: Price (Low to High)</option>
                    <option value="price-high">Sort by: Price (High to Low)</option>
                    <option value="newest">Sort by: Newest</option>
                  </select>

                  {/* View Toggle */}
                  <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                          : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      aria-label="Grid view"
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`p-2 transition-colors ${
                        viewMode === 'map'
                          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                          : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      aria-label="Map view"
                    >
                      <Map size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <HouseCardSkeleton key={i} />
                ))}
              </div>
            ) : viewMode === 'map' ? (
              /* Map View */
              <MapView houses={sortedHouses} />
            ) : paginatedHouses.length === 0 ? (
              /* Empty State */
              <EmptyState
                title="No houses found"
                description="Try adjusting your filters to see more results."
                actionLabel="Clear all filters"
                onAction={handleClearAll}
              />
            ) : (
              <>
                {/* Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedHouses.map((house) => (
                    <HouseCard key={house.id} {...house} showComparison />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        selectedLocations={selectedLocations}
        setSelectedLocations={setSelectedLocations}
        selectedThemes={selectedThemes}
        setSelectedThemes={setSelectedThemes}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        duration={duration}
        setDuration={setDuration}
        capacity={capacity}
        setCapacity={setCapacity}
        status={status}
        setStatus={setStatus}
        onClearAll={handleClearAll}
      />
    </div>
  )
}

export default SearchResultsPage
