import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FileText, Search, Calendar, MapPin, User, Mail, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

interface ApplicationWithHouse {
  id: string
  house_id: number
  applicant_id: string
  applicant_name: string
  email: string
  phone: string | null
  linkedin: string | null
  portfolio: string | null
  current_role: string | null
  company: string | null
  skills: string | null
  years_experience: number | null
  building_what: string | null
  why_this_house: string | null
  duration_preference: string | null
  move_in_date: string | null
  custom_answers: Record<string, string> | null
  status: 'Pending' | 'Accepted' | 'Rejected'
  created_at: string
  updated_at: string
  house: {
    id: number
    slug: string | null
    name: string
    city: string
    state: string
    images: string[] | null
    price_per_month: number
  } | null
}

function AdminApplicationsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<ApplicationWithHouse[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [houseFilter, setHouseFilter] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/')
      return
    }
  }, [authLoading, isAdmin, navigate])

  const fetchApplications = useCallback(async () => {
    if (!user || !isAdmin) return

    try {
      setLoading(true)
      let query = supabase
        .from('applications')
        .select(`
          *,
          house:houses (
            id,
            slug,
            name,
            city,
            state,
            images,
            price_per_month
          )
        `)
        .order('created_at', { ascending: false })

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      // Apply house filter
      if (houseFilter !== 'all') {
        query = query.eq('house_id', parseInt(houseFilter))
      }

      const { data, error } = await query

      if (error) throw error

      setApplications((data as ApplicationWithHouse[]) || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [user, isAdmin, statusFilter, houseFilter])

  useEffect(() => {
    if (user && isAdmin) {
      fetchApplications()
    }
  }, [user, isAdmin, fetchApplications])

  // Get unique houses for filter dropdown
  const uniqueHouses = Array.from(
    new Map(
      applications.map(app => app.house && [app.house.id, app.house])
        .filter((item): item is [number, NonNullable<ApplicationWithHouse['house']>] => item !== null)
    ).values()
  )

  const getStatusBadge = (status: string) => {
    const badges = {
      Pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', label: 'Pending', icon: Clock },
      Accepted: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', label: 'Accepted', icon: CheckCircle },
      Rejected: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', label: 'Rejected', icon: XCircle },
    }
    const badge = badges[status as keyof typeof badges] || badges.Pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    )
  }

  const filteredApplications = applications.filter(app => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      app.applicant_name.toLowerCase().includes(query) ||
      app.email.toLowerCase().includes(query) ||
      app.house?.name.toLowerCase().includes(query) ||
      app.house?.city.toLowerCase().includes(query) ||
      app.current_role?.toLowerCase().includes(query) ||
      app.company?.toLowerCase().includes(query)
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
        <AdminSidebar currentTab="applications" />
        <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Applications Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all applications across all houses
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, email, house..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {/* House Filter */}
                <select
                  value={houseFilter}
                  onChange={(e) => setHouseFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Houses</option>
                  {uniqueHouses.map(house => (
                    <option key={house.id} value={house.id}>
                      {house.name} ({house.city}, {house.state})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Applications List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {filteredApplications.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No applications found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery || statusFilter !== 'all' || houseFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'No applications have been submitted yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          House
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredApplications.map((application) => (
                        <tr
                          key={application.id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                <User size={20} className="text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {application.applicant_name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Mail size={12} />
                                  {application.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {application.house ? (
                              <Link
                                to={`/house/${application.house.slug || application.house.id}`}
                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {application.house.name}
                              </Link>
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400">Unknown House</span>
                            )}
                            {application.house && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                <MapPin size={12} />
                                {application.house.city}, {application.house.state}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              {application.current_role && (
                                <div>
                                  <span className="font-medium">Role:</span> {application.current_role}
                                  {application.company && ` at ${application.company}`}
                                </div>
                              )}
                              {application.years_experience && (
                                <div>
                                  <span className="font-medium">Experience:</span> {application.years_experience} years
                                </div>
                              )}
                              {application.duration_preference && (
                                <div>
                                  <span className="font-medium">Duration:</span> {application.duration_preference}
                                </div>
                              )}
                              {application.move_in_date && (
                                <div>
                                  <span className="font-medium">Move-in:</span> {new Date(application.move_in_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {getStatusBadge(application.status)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {new Date(application.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                              <Calendar size={12} />
                              {new Date(application.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {applications.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Applications</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {applications.filter(a => a.status === 'Pending').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {applications.filter(a => a.status === 'Accepted').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accepted</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {applications.filter(a => a.status === 'Rejected').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminApplicationsPage
