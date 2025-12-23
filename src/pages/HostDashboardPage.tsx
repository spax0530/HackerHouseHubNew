import { useState, useEffect } from 'react'
import { Plus, Eye, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import AddHouseWizard from '../components/AddHouseWizard'
import HouseCard from '../components/HouseCard'
import EmptyState from '../components/EmptyState'
import ApplicationReviewDrawer from '../components/ApplicationReviewDrawer'
import { useAuth } from '../context/AuthContext'
import { supabase, type House, type Application } from '../lib/supabase'

interface HostHouse extends House {
  views: number // Map from impressions
  applications: number // Map from applications_count
}

function HostDashboardPage() {
  const { user } = useAuth()
  const [currentTab, setCurrentTab] = useState('overview')
  const [hostHouses, setHostHouses] = useState<HostHouse[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddHouseWizardOpen, setIsAddHouseWizardOpen] = useState(false)
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // 1. Fetch houses
      const { data: housesData, error: housesError } = await supabase
        .from('houses')
        .select('*')
        .eq('host_id', user!.id)

      if (housesError) throw housesError

      const formattedHouses = (housesData || []).map(h => ({
        ...h,
        views: h.impressions || 0,
        applications: h.applications_count || 0
      })) as HostHouse[]

      setHostHouses(formattedHouses)

      // 2. Fetch applications for these houses
      if (formattedHouses.length > 0) {
        const houseIds = formattedHouses.map(h => h.id)
        const { data: appsData, error: appsError } = await supabase
          .from('applications')
          .select(`
            *,
            house:houses (
              name
            )
          `)
          .in('house_id', houseIds)
          .order('created_at', { ascending: false })

        if (appsError) throw appsError

        // Transform for display
        const formattedApps = (appsData || []).map(app => ({
          id: app.id, 
          applicantName: app.applicant_name,
          email: app.email,
          houseName: app.house?.name,
          appliedAt: app.created_at,
          status: app.status,
          // Map snake_case to camelCase for components if needed, or pass raw
          ...app
        }))

        setApplications(formattedApps)
      } else {
        setApplications([])
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleHouseAdded = (newHouse: any) => {
    // Refresh data
    fetchDashboardData()
  }

  const handleStatusChange = async (houseId: number, newStatus: 'Recruiting Now' | 'Full' | 'Closed') => {
    try {
      const { error } = await supabase
        .from('houses')
        .update({ status: newStatus })
        .eq('id', houseId)

      if (error) throw error

      setHostHouses((prev) =>
        prev.map((house) => (house.id === houseId ? { ...house, status: newStatus } : house))
      )
      toast.success('House status updated')
    } catch (error) {
      console.error('Error updating house status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleApplicationStatusChange = async (
    applicationId: string,
    newStatus: 'Pending' | 'Accepted' | 'Rejected'
  ) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId)

      if (error) throw error

      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      )
      
      // Also update selected application if it's open
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication(prev => ({ ...prev, status: newStatus }))
      }

      toast.success(`Application ${newStatus.toLowerCase()}`, {
        description: 'The applicant has been notified.',
      })
    } catch (error) {
      console.error('Error updating application status:', error)
      toast.error('Failed to update application')
    }
  }

  const handleReviewApplication = (application: any) => {
    setSelectedApplication(application)
    setReviewDrawerOpen(true)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`
  }

  const pendingApplications = applications.filter((app) => app.status === 'Pending')
  const totalViews = hostHouses.reduce((sum, house) => sum + (house.views || 0), 0)
  const activeHouses = hostHouses.filter((house) => house.status === 'Recruiting Now').length
  const conversionRate = totalViews > 0 ? ((applications.length / totalViews) * 100).toFixed(1) : '0'

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <DashboardSidebar currentTab={currentTab} onChangeTab={setCurrentTab} />

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {/* Overview Tab */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Welcome back</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="text-blue-600 dark:text-blue-400" size={24} />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {totalViews.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="text-green-600 dark:text-green-400" size={24} />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Houses</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {activeHouses}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="text-orange-600 dark:text-orange-400" size={24} />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pending Applications
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {pendingApplications.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="text-purple-600 dark:text-purple-400" size={24} />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {conversionRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Recent Applications
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          House
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Applied
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {applications.slice(0, 5).map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {app.applicantName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {app.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {app.houseName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {getTimeAgo(app.appliedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                app.status === 'Accepted'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : app.status === 'Rejected'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {applications.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <EmptyState
                              title="No applications yet"
                              description="Applications will appear here once builders start applying to your houses."
                            />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Houses Tab */}
          {currentTab === 'houses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Your Houses
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage your listed hacker houses
                  </p>
                </div>
                <button
                  onClick={() => setIsAddHouseWizardOpen(true)}
                  className="px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add New House
                </button>
              </div>

              {hostHouses.length === 0 ? (
                <EmptyState
                  title="No houses yet"
                  description="Get started by adding your first hacker house."
                  actionLabel="Add New House"
                  onAction={() => setIsAddHouseWizardOpen(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hostHouses.map((house) => (
                    <div
                      key={house.id}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                      <HouseCard
                        id={house.id}
                        name={house.name}
                        city={house.city}
                        state={house.state}
                        theme={house.theme as any} // Cast theme if types differ slightly
                        price={`$${house.price_per_month}/mo`}
                        duration={house.duration}
                        capacity={house.capacity}
                        status={house.status}
                        image={house.images?.[0] || ''}
                        showComparison={false}
                      />
                      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            <Eye size={14} className="inline mr-1" />
                            {house.views || 0} views
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            <FileText size={14} className="inline mr-1" />
                            {house.applications || 0} applications
                          </span>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status
                          </label>
                          <select
                            value={house.status}
                            onChange={(e) =>
                              handleStatusChange(
                                house.id,
                                e.target.value as 'Recruiting Now' | 'Full' | 'Closed'
                              )
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Recruiting Now">Recruiting Now</option>
                            <option value="Full">Full</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {currentTab === 'applications' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Applications
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Review and manage applications for your houses
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          House
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Applied At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {app.applicantName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {app.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {app.houseName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {getTimeAgo(app.appliedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                app.status === 'Accepted'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : app.status === 'Rejected'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleReviewApplication(app)}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
                              >
                                <Eye size={14} />
                                Review
                              </button>
                              {app.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleApplicationStatusChange(app.id, 'Accepted')}
                                    className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                                  >
                                    <CheckCircle size={14} />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleApplicationStatusChange(app.id, 'Rejected')}
                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
                                  >
                                    <XCircle size={14} />
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {applications.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <EmptyState
                              title="No applications yet"
                              description="Applications will appear here once builders start applying to your houses."
                            />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {currentTab === 'messages' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Messages
              </h1>
              <EmptyState
                title="Messaging coming soon"
                description="Direct messaging with applicants and builders will be available soon."
              />
            </div>
          )}

          {/* Analytics Tab */}
          {currentTab === 'analytics' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Analytics
              </h1>
              <EmptyState
                title="Analytics coming soon"
                description="Soon you'll be able to see views, applications, and trends for your houses here."
              />
            </div>
          )}

          {/* Settings Tab */}
          {currentTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your host profile</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    toast.success('Settings saved', {
                      description: 'Your profile has been updated.',
                    })
                  }}
                  className="space-y-4 max-w-2xl"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      defaultValue="David Chen"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="david@example.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Host Bio
                    </label>
                    <textarea
                      rows={4}
                      defaultValue="Tech entrepreneur and community builder. Passionate about fostering innovation and connecting builders."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add House Wizard */}
      <AddHouseWizard
        open={isAddHouseWizardOpen}
        onOpenChange={setIsAddHouseWizardOpen}
        onHouseAdded={handleHouseAdded}
      />

      {/* Application Review Drawer */}
      <ApplicationReviewDrawer
        open={reviewDrawerOpen}
        onClose={() => {
          setReviewDrawerOpen(false)
          setSelectedApplication(null)
        }}
        application={selectedApplication}
        onStatusChange={handleApplicationStatusChange}
      />
    </div>
  )
}

export default HostDashboardPage
