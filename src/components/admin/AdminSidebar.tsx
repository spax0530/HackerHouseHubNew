import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  BarChart3,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

interface AdminSidebarProps {
  currentTab: string
}

const tabs = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
  { key: 'houses', label: 'Houses', icon: Building2, path: '/admin/houses' },
  { key: 'users', label: 'Users', icon: Users, path: '/admin/users' },
  { key: 'applications', label: 'Applications', icon: FileText, path: '/admin/applications' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
]

function AdminSidebar({ currentTab }: AdminSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleTabClick = (path: string) => {
    navigate(path)
  }

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 p-4">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 px-4">Admin Portal</h2>
      </div>
      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path || currentTab === tab.key

          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-l-4 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default AdminSidebar

