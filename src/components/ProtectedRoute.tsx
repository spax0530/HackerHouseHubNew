import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('applicant' | 'host')[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Add timeout for loading state to prevent infinite loading
  const [showLoading, setShowLoading] = useState(true)
  
  useEffect(() => {
    if (!loading) {
      setShowLoading(false)
    } else {
      // If loading takes more than 5 seconds, stop showing spinner
      const timeout = setTimeout(() => {
        setShowLoading(false)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [loading])

  if (loading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />
  }

  // If no profile but user exists, allow access (profile might be loading or missing)
  // Only check role if profile exists and allowedRoles is specified
  if (allowedRoles && profile && !allowedRoles.includes(profile.role as any)) {
    // If user has a role but it's not allowed, redirect to their home
    if (profile.role === 'host') {
      return <Navigate to="/host/dashboard" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
