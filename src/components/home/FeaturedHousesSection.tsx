import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import HouseCard from '../HouseCard'
import { HouseCardSkeleton } from '../LoadingSkeleton'
import { supabase, type House } from '../../lib/supabase'

function FeaturedHousesSection() {
  const [featuredHouses, setFeaturedHouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeaturedHouses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        //.eq('featured', true) // Or just order by newest for now if featured flag isn't set
        .eq('admin_status', 'approved') // Only show approved houses
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error

      if (data) {
        const formatted = data.map((h: House) => ({
          id: h.id,
          name: h.name,
          city: h.city,
          state: h.state,
          theme: h.theme as any,
          price: `$${h.price_per_month}/mo`,
          pricePerMonth: h.price_per_month, // For sorting/logic if needed
          duration: h.duration,
          capacity: h.capacity,
          status: h.status,
          image: h.images?.[0] || '', // Use first image
        }))
        setFeaturedHouses(formatted)
      }
    } catch (error) {
      console.error('Error fetching featured houses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeaturedHouses()

    // Set up real-time subscription for new houses
    const channel = supabase
      .channel('houses-changes')
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
          fetchFeaturedHouses()
        }
      )
      .subscribe()

    // Also refetch when page becomes visible (user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchFeaturedHouses()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      channel.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 md:mb-12 gap-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Featured Hacker Houses
          </h2>
          <Link
            to="/search"
            className="text-sm md:text-base text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5"
          >
            View All
            <span className="text-lg">→</span>
          </Link>
        </div>

        {/* Houses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <HouseCardSkeleton key={i} />)
          ) : featuredHouses.length > 0 ? (
            featuredHouses.map((house) => (
              <HouseCard key={house.id} {...house} showComparison />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              No featured houses found.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default FeaturedHousesSection
