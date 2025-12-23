import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Building2, Sun, Moon, Menu, User, LogOut } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import MobileMenu from './MobileMenu'

function Navbar() {
  const { darkMode, toggleDarkMode, favorites } = useAppContext()
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    // No need to reload window usually, React state should handle updates
  }

  const isHost = profile?.role === 'host'
  const isBuilder = profile?.role === 'applicant'

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand */}
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity"
            >
              <Building2 size={22} />
              <span className="font-semibold text-base md:text-lg">HackerHouseHub</span>
            </Link>

            {/* Center: Nav Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {/* Common Links or based on role */}
              {!isHost && (
                <>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive && window.location.pathname === '/'
                          ? 'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/search"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`
                    }
                  >
                    Search
                  </NavLink>
                  <NavLink
                    to="/favorites"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                        isActive
                          ? 'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`
                    }
                  >
                    Saved
                    {favorites.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                        {favorites.length}
                      </span>
                    )}
                  </NavLink>
                </>
              )}

              {isBuilder && (
                <NavLink
                  to="/applications"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`
                  }
                >
                  My Applications
                </NavLink>
              )}

              {isHost && (
                <NavLink
                  to="/host/dashboard"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`
                  }
                >
                  Host Dashboard
                </NavLink>
              )}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Auth Section */}
              {user ? (
                <>
                  {/* List Your House (Host Only or if user is host) */}
                  {isHost && (
                    <Link
                      to="/host/dashboard" // Or direct to add house wizard if supported via query param
                      className="hidden sm:inline-flex items-center px-3 md:px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                      List Your House
                    </Link>
                  )}

                  {/* User Info / Profile Link */}
                  <Link 
                    to="/profile"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                        <User size={16} />
                    )}
                    <span className="font-medium max-w-[100px] truncate">{profile?.full_name || user.email?.split('@')[0]}</span>
                  </Link>
                  
                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="hidden sm:inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <>
                  {/* Sign In Button */}
                  <Link
                    to="/auth/sign-in"
                    className="hidden sm:inline-flex items-center px-3 md:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Sign In
                  </Link>
                   {/* Sign Up Button (New) */}
                   <Link
                    to="/auth/sign-up"
                    className="hidden sm:inline-flex items-center px-3 md:px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Sign Up
                  </Link>
                  {/* List Your House Button (Desktop - Public) */}
                  <Link
                    to="/auth/sign-up?type=host"
                    className="hidden sm:inline-flex items-center px-3 md:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    List Your House
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  )
}

export default Navbar
