import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Search, Mail } from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useAuth } from '../../context/AuthContext'
import { supabase, type Profile } from '../../lib/supabase'

function AdminUsersPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/')
      return
    }
  }, [authLoading, isAdmin, navigate])

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers()
    }
  }, [user, isAdmin, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })

      // Apply role filter
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter)
      }

      const { data, error } = await query

      if (error) throw error

      setUsers((data || []) as Profile[])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'applicant' | 'host' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))

      toast.success(`User role updated to ${newRole}`)
      
      // Refresh the list
      fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const getRoleBadge = (role: string | null) => {
    const badges = {
      admin: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', label: 'Admin' },
      host: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', label: 'Host' },
      applicant: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', label: 'Builder' },
    }
    const badge = badges[role as keyof typeof badges] || badges.applicant
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      (user.full_name?.toLowerCase().includes(query)) ||
      (user.email?.toLowerCase().includes(query))
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
        <AdminSidebar currentTab="users" />

        {/* Main Content */}
        <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all users
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
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Role Filter */}
                <div className="flex gap-2">
                  {['all', 'applicant', 'host', 'admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setRoleFilter(role)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        roleFilter === role
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {role === 'applicant' ? 'Builder' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
                  <p className="text-gray-600 dark:text-gray-400">No users found</p>
                </div>
              ) : (
                filteredUsers.map((userProfile) => (
                  <div
                    key={userProfile.id}
                    className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                          {userProfile.avatar_url ? (
                            <img src={userProfile.avatar_url} alt={userProfile.full_name || ''} className="w-full h-full object-cover" />
                          ) : (
                            <User className="text-gray-400" size={24} />
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {userProfile.full_name || 'Unnamed User'}
                            </h3>
                            {getRoleBadge(userProfile.role)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <Mail size={14} />
                            <span>{userProfile.email || 'No email'}</span>
                          </div>
                          {userProfile.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                              {userProfile.bio}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Joined {new Date(userProfile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Role Change Dropdown */}
                      <div className="ml-4">
                        <select
                          value={userProfile.role || 'applicant'}
                          onChange={(e) => handleRoleChange(userProfile.id, e.target.value as 'applicant' | 'host' | 'admin')}
                          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                        >
                          <option value="applicant">Builder</option>
                          <option value="host">Host</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
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

export default AdminUsersPage

