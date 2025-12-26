import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Users, FileText, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalHouses: 0,
    pendingHouses: 0,
    totalUsers: 0,
    totalHosts: 0,
    totalApplicants: 0,
    totalApplications: 0,
    pendingApplications: 0,
  })

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/')
      return
    }
  }, [authLoading, isAdmin, navigate])

  useEffect(() => {
    if (user && isAdmin) {
      fetchStats()
    }
  }, [user, isAdmin])

  const fetchStats = async () => {
    try {
      setLoading(true)

      // Fetch house stats
      const { data: housesData, error: housesError } = await supabase
        .from('houses')
        .select('id, admin_status')

      if (housesError) throw housesError

      const totalHouses = housesData?.length || 0
      const pendingHouses = housesData?.filter(h => h.admin_status === 'pending').length || 0

      // Fetch user stats
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, role')

      if (usersError) throw usersError

      const totalUsers = usersData?.length || 0
      const totalHosts = usersData?.filter(u => u.role === 'host').length || 0
      const totalApplicants = usersData?.filter(u => u.role === 'applicant').length || 0

      // Fetch application stats
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('id, status')

      if (appsError) throw appsError

      const totalApplications = appsData?.length || 0
      const pendingApplications = appsData?.filter(a => a.status === 'Pending').length || 0

      setStats({
        totalHouses,
        pendingHouses,
        totalUsers,
        totalHosts,
        totalApplicants,
        totalApplications,
        pendingApplications,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

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
        <AdminSidebar currentTab="overview" />

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Platform overview and statistics
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pending Houses Card */}
              <div 
                className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate('/admin/houses?status=pending')}
              >
                <div className="flex items-center justify-between mb-2">
                  <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
                  <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                    Action Required
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Houses</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.pendingHouses}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {stats.totalHouses} total houses
                </p>
              </div>

              {/* Total Houses Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Houses</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalHouses}
                </p>
              </div>

              {/* Total Users Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalUsers}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                  <span>{stats.totalHosts} hosts</span>
                  <span>{stats.totalApplicants} applicants</span>
                </div>
              </div>

              {/* Applications Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Applications</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalApplications}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {stats.pendingApplications} pending
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/admin/houses?status=pending')}
                  className="flex items-center gap-3 p-4 rounded-lg border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-left"
                >
                  <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Review Pending Houses</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.pendingHouses} houses waiting approval
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center gap-3 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
                >
                  <Users className="text-blue-600 dark:text-blue-400" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Manage Users</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View and manage {stats.totalUsers} users
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/admin/applications')}
                  className="flex items-center gap-3 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
                >
                  <FileText className="text-purple-600 dark:text-purple-400" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">View Applications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.totalApplications} total applications
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage

