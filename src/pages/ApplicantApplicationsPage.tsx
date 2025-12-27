import { useEffect, useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calendar, MapPin, Building2, Clock, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function ApplicantApplicationsPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchApplications = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('Fetching applications for user:', user.id)
      
      // First, try to fetch applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false })

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError)
        throw applicationsError
      }

      console.log('Fetched applications (raw):', applicationsData)

      if (!applicationsData || applicationsData.length === 0) {
        console.log('No applications found for user:', user.id)
        setApplications([])
        return
      }

      // Now fetch house details for each application
      const houseIds = [...new Set(applicationsData.map(app => app.house_id))]
      const { data: housesData, error: housesError } = await supabase
        .from('houses')
        .select('id, slug, name, city, state, images, price_per_month')
        .in('id', houseIds)

      if (housesError) {
        console.error('Error fetching houses:', housesError)
        // Continue even if house fetch fails - we'll just show applications without house details
      }

      console.log('Fetched houses:', housesData)

      // Create a map of house_id -> house
      const housesMap = new Map(
        (housesData || []).map(house => [house.id, house])
      )

      // Combine applications with house data
      const transformed = applicationsData.map(app => {
        const house = housesMap.get(app.house_id)
        return {
          ...app,
          house: house ? {
            ...house,
            image: Array.isArray(house.images) && house.images.length > 0 
              ? house.images[0] 
              : null
          } : null
        }
      })

      console.log('Transformed applications:', transformed)
      setApplications(transformed)
    } catch (error: any) {
      console.error('Error fetching applications:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      })
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  // Refetch when navigating to this page (e.g., after submitting an application)
  useEffect(() => {
    if (location.pathname === '/applications' && user) {
      fetchApplications()
    }
  }, [location.pathname, user, fetchApplications])

  // Set up real-time subscription for applications
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('applicant-applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `applicant_id=eq.${user.id}`,
        },
        () => {
          fetchApplications()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, fetchApplications])

  // Refetch when page becomes visible (user might have submitted application in another tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchApplications()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, fetchApplications])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle size={16} />
      case 'Rejected':
        return <XCircle size={16} />
      default:
        return <Clock size={16} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Applications</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Track the status of your hacker house applications
        </p>

        {applications.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No applications yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              You haven't applied to any hacker houses yet. Browse our listings to find your next community.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Explore Houses
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  {/* House Image */}
                  <div className="w-full md:w-48 h-32 flex-shrink-0 bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                    {application.house?.image ? (
                      <img
                        src={application.house.image}
                        alt={application.house.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Building2 size={32} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <Link
                          to={`/house/${application.house?.slug || application.house_id}`}
                          className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {application.house?.name || 'Unknown House'}
                        </Link>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                          <MapPin size={16} />
                          <span>{application.house?.city}, {application.house?.state}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Applied on {new Date(application.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 size={14} />
                            {application.house?.price_per_month ? `$${application.house.price_per_month}/mo` : 'Price N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {getStatusIcon(application.status)}
                        {application.status}
                      </div>
                    </div>

                    {/* Additional Info if needed */}
                    {application.custom_answers && Object.keys(application.custom_answers).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Your Application Details
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          Duration: {application.duration_preference} • Move-in: {application.move_in_date}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicantApplicationsPage

