import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('applicant' | 'host')[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />
  }

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
