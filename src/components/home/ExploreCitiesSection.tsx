import { useEffect, useState } from 'react'
import CityCard from '../CityCard'
import { supabase } from '../../lib/supabase'

// City images mapping (fallback if no house images available)
const cityImages: Record<string, string> = {
  'San Francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=600&fit=crop',
  'Los Angeles': 'https://images.unsplash.com/photo-1515895306151-8a2f547240c4?w=600&h=600&fit=crop',
  'Austin': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=600&fit=crop',
  'Miami': 'https://images.unsplash.com/photo-1513884923967-4d182d5e9baf?w=600&h=600&fit=crop',
  'Seattle': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=600&fit=crop',
  'Portland': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&h=600&fit=crop',
  'Boston': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&h=600&fit=crop',
  'Denver': 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=600&h=600&fit=crop',
  'Chicago': 'https://images.unsplash.com/photo-1494522358652-f04cc045448d?w=600&h=600&fit=crop',
  'Atlanta': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&h=600&fit=crop',
  'Nashville': 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&h=600&fit=crop',
}

function ExploreCitiesSection() {
  const [cities, setCities] = useState<Array<{ name: string; city: string; count: number; image: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true)
        // Fetch all approved houses grouped by city
        const { data, error } = await supabase
          .from('houses')
          .select('city, state, images')
          .eq('admin_status', 'approved')

        if (error) throw error

        // Group by city and count
        const cityMap = new Map<string, { count: number; image: string | null }>()
        
        data?.forEach((house) => {
          const cityKey = house.city
          const existing = cityMap.get(cityKey) || { count: 0, image: null }
          cityMap.set(cityKey, {
            count: existing.count + 1,
            image: existing.image || (house.images && house.images.length > 0 ? house.images[0] : null),
          })
        })

        // Convert to array and sort by count (descending)
        const citiesArray = Array.from(cityMap.entries())
          .map(([city, data]) => ({
            name: city,
            city: city,
            count: data.count,
            image: data.image || cityImages[city] || 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=600&fit=crop',
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6) // Show top 6 cities

        setCities(citiesArray)
      } catch (error) {
        console.error('Error fetching cities:', error)
        // Fallback to default cities if fetch fails
        setCities([
          { name: 'San Francisco', city: 'San Francisco', count: 0, image: cityImages['San Francisco'] || '' },
          { name: 'Los Angeles', city: 'Los Angeles', count: 0, image: cityImages['Los Angeles'] || '' },
          { name: 'Austin', city: 'Austin', count: 0, image: cityImages['Austin'] || '' },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCities()
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
              Explore by City
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
              Discover hacker houses in top tech cities across the U.S.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (cities.length === 0) {
    return null // Don't show section if no cities
  }

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gray-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
            Explore by City
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Discover hacker houses in top tech cities across the U.S.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {cities.map((city) => (
            <CityCard key={city.name} {...city} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ExploreCitiesSection
