import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useAuth } from '../../context/AuthContext'

function AdminApplicationsPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/')
      return
    }
  }, [authLoading, isAdmin, navigate])

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
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Applications Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Coming soon - View and manage all applications across all houses
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminApplicationsPage

