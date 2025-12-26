import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'sonner'
import MainLayout from './layouts/MainLayout'
import ConfigError from './components/ConfigError'
import { isSupabaseConfigured } from './lib/supabase'
import HomePage from './pages/HomePage'
import SearchResultsPage from './pages/SearchResultsPage'
import FavoritesPage from './pages/FavoritesPage'
import HostDashboardPage from './pages/HostDashboardPage'
import HouseDetailPage from './pages/HouseDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import SignInPage from './pages/auth/SignInPage'
import SignUpPage from './pages/auth/SignUpPage'
import ApplicantApplicationsPage from './pages/ApplicantApplicationsPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminHousesPage from './pages/admin/AdminHousesPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return <ConfigError />
  }

  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Toaster />
          <MainLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/house/:id" element={<HouseDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Auth Routes */}
              <Route path="/auth/sign-in" element={<SignInPage />} />
              <Route path="/auth/sign-up" element={<SignUpPage />} />

              {/* Protected Routes */}
              <Route 
                path="/host/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['host']}>
                    <HostDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/applications" 
                element={
                  <ProtectedRoute allowedRoles={['applicant']}>
                    <ApplicantApplicationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/houses" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminHousesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/applications" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminApplicationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminAnalyticsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
