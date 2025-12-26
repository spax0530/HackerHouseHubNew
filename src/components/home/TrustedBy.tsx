import { useEffect, useState } from 'react'
import { Building2, Users, FileText, MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function TrustedBy() {
  const [metrics, setMetrics] = useState({
    totalHouses: 0,
    totalUsers: 0,
    totalApplications: 0,
    totalCities: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        
        // Fetch all metrics in parallel
        const [housesResult, usersResult, applicationsResult, citiesResult] = await Promise.all([
          supabase
            .from('houses')
            .select('id', { count: 'exact', head: true })
            .eq('admin_status', 'approved'),
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('applications')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('houses')
            .select('city')
            .eq('admin_status', 'approved'),
        ])

        const totalHouses = housesResult.count || 0
        const totalUsers = usersResult.count || 0
        const totalApplications = applicationsResult.count || 0
        
        // Count unique cities
        const uniqueCities = new Set(citiesResult.data?.map(h => h.city) || [])
        const totalCities = uniqueCities.size

        setMetrics({
          totalHouses,
          totalUsers,
          totalApplications,
          totalCities,
        })
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const displayMetrics = [
    {
      value: loading ? '...' : metrics.totalHouses > 0 ? `${metrics.totalHouses}+` : '0',
      label: 'Hacker Houses',
      icon: Building2,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      value: loading ? '...' : metrics.totalUsers > 0 ? `${metrics.totalUsers}+` : '0',
      label: 'Active Members',
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      value: loading ? '...' : metrics.totalApplications > 0 ? `${metrics.totalApplications}+` : '0',
      label: 'Applications',
      icon: FileText,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      value: loading ? '...' : metrics.totalCities > 0 ? `${metrics.totalCities}+` : '0',
      label: 'Cities',
      icon: MapPin,
      color: 'text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Join a Growing Community
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real numbers from our platform
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
          {displayMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-800 text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 ${metric.color}`}>
                  <Icon size={24} />
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {metric.value}
                </div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                  {metric.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TrustedBy
