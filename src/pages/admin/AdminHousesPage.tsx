import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Pause, Eye, Star, Search } from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useAuth } from '../../context/AuthContext'
import { supabase, type House } from '../../lib/supabase'

function AdminHousesPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [houses, setHouses] = useState<House[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all')

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/')
      return
    }
  }, [authLoading, isAdmin, navigate])

  useEffect(() => {
    if (user && isAdmin) {
      fetchHouses()
    }
  }, [user, isAdmin, statusFilter])

  const fetchHouses = async () => {
    try {
      setLoading(true)
      let query = supabase.from('houses').select('*, host:profiles(full_name, email)')

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('admin_status', statusFilter)
      }

      // Order by created date (newest first)
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      setHouses((data as any) || [])
    } catch (error) {
      console.error('Error fetching houses:', error)
      toast.error('Failed to load houses')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (houseId: number, newStatus: 'approved' | 'rejected' | 'paused') => {
    try {
      const { error } = await supabase
        .from('houses')
        .update({ admin_status: newStatus })
        .eq('id', houseId)

      if (error) throw error

      // Update local state
      setHouses(prev => prev.map(h => h.id === houseId ? { ...h, admin_status: newStatus } : h))

      const statusMessages = {
        approved: 'House approved and now visible to users',
        rejected: 'House rejected',
        paused: 'House paused',
      }

      toast.success(statusMessages[newStatus])
    } catch (error) {
      console.error('Error updating house status:', error)
      toast.error('Failed to update house status')
    }
  }

  const handleFeatureToggle = async (houseId: number, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('houses')
        .update({ featured })
        .eq('id', houseId)

      if (error) throw error

      setHouses(prev => prev.map(h => h.id === houseId ? { ...h, featured } : h))
      toast.success(featured ? 'House featured' : 'House unfeatured')
    } catch (error) {
      console.error('Error toggling featured status:', error)
      toast.error('Failed to update featured status')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      approved: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', label: 'Approved' },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', label: 'Pending' },
      rejected: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', label: 'Rejected' },
      paused: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', label: 'Paused' },
    }
    const badge = badges[status as keyof typeof badges] || badges.pending
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  const filteredHouses = houses.filter(house => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      house.name.toLowerCase().includes(query) ||
      house.city.toLowerCase().includes(query) ||
      house.theme.toLowerCase().includes(query)
    )
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <AdminSidebar currentTab="houses" />

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                House Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Review and manage all houses
              </p>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search houses by name, city, or theme..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                  {['all', 'pending', 'approved', 'rejected', 'paused'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        statusFilter === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Houses List */}
            <div className="space-y-4">
              {filteredHouses.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
                  <p className="text-gray-600 dark:text-gray-400">
                    {statusFilter === 'all' ? 'No houses found' : `No ${statusFilter} houses found`}
                  </p>
                </div>
              ) : (
                filteredHouses.map((house: any) => (
                  <div
                    key={house.id}
                    className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {house.name}
                          </h3>
                          {getStatusBadge(house.admin_status)}
                          {house.featured && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span>{house.city}, {house.state}</span>
                          <span>•</span>
                          <span>{house.theme}</span>
                          <span>•</span>
                          <span>${house.price_per_month}/mo</span>
                          <span>•</span>
                          <span>{house.applications_count || 0} applications</span>
                        </div>
                        {house.host && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                            Host: {house.host.full_name || house.host.email}
                          </p>
                        )}
                        {house.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                            {house.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <button
                        onClick={() => navigate(`/house/${house.slug || house.id}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                      >
                        <Eye size={16} />
                        View
                      </button>

                      {house.admin_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(house.id, 'approved')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            <CheckCircle size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(house.id, 'rejected')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </>
                      )}

                      {house.admin_status === 'approved' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(house.id, 'paused')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors text-sm font-medium"
                          >
                            <Pause size={16} />
                            Pause
                          </button>
                          <button
                            onClick={() => handleFeatureToggle(house.id, !house.featured)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                              house.featured
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Star size={16} />
                            {house.featured ? 'Unfeature' : 'Feature'}
                          </button>
                        </>
                      )}

                      {(house.admin_status === 'rejected' || house.admin_status === 'paused') && (
                        <button
                          onClick={() => handleStatusChange(house.id, 'approved')}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHousesPage

