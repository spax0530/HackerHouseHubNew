import {
  LayoutDashboard,
  Building2,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
} from 'lucide-react'

interface DashboardSidebarProps {
  currentTab: string
  onChangeTab: (tab: string) => void
}

const tabs = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'houses', label: 'Houses', icon: Building2 },
  { key: 'applications', label: 'Applications', icon: FileText },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'settings', label: 'Settings', icon: Settings },
]

function DashboardSidebar({ currentTab, onChangeTab }: DashboardSidebarProps) {
  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 p-4">
      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.key

          return (
            <button
              key={tab.key}
              onClick={() => onChangeTab(tab.key)}
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

export default DashboardSidebar

