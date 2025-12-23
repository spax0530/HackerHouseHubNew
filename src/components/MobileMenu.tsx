import { Link } from 'react-router-dom'
import { X, LogOut, User, Settings } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { favorites } = useAppContext()
  const { user, profile, signOut } = useAuth()
  
  if (!isOpen) return null

  const isHost = profile?.role === 'host'
  const isBuilder = profile?.role === 'applicant'

  const handleSignOut = async () => {
    await signOut()
    onClose()
    window.location.href = '/' // Simple redirect
  }

  // Define links based on role
  const getNavLinks = () => {
    if (!user) {
      return [
        { path: '/', label: 'Explore' },
        { path: '/search', label: 'Search Houses' },
        { path: '/favorites', label: 'Saved', badge: favorites.length > 0 ? favorites.length : null },
        { path: '/auth/sign-up?type=host', label: 'List Your House' },
        { path: '/auth/sign-in', label: 'Sign In' },
        { path: '/auth/sign-up', label: 'Sign Up' },
      ]
    }

    if (isHost) {
      return [
        { path: '/host/dashboard', label: 'Host Dashboard' },
        { path: '/profile', label: 'Profile Settings' },
      ]
    }

    if (isBuilder) {
      return [
        { path: '/', label: 'Home' },
        { path: '/search', label: 'Search Houses' },
        { path: '/favorites', label: 'Saved', badge: favorites.length > 0 ? favorites.length : null },
        { path: '/applications', label: 'My Applications' },
        { path: '/profile', label: 'Profile Settings' },
      ]
    }

    // Fallback if user exists but role is null (shouldn't happen often)
    return [
      { path: '/', label: 'Home' },
      { path: '/search', label: 'Search' },
      { path: '/profile', label: 'Profile' },
    ]
  }

  const navLinks = getNavLinks()

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-slate-900 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Menu</span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info (if logged in) */}
          {user && (
            <Link 
              to="/profile"
              onClick={onClose}
              className="block p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 overflow-hidden">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {profile?.full_name || user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {profile?.role || 'User'}
                    </p>
                  </div>
                  <Settings size={16} className="text-gray-400" />
               </div>
            </Link>
          )}

          
          {/* Nav Links */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span>{link.label}</span>
                {link.badge !== null && link.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            
            {user && (
               <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-4"
               >
                  <LogOut size={20} />
                  <span>Sign Out</span>
               </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default MobileMenu
