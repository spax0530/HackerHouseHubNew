import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'

function SignInPage() {
  const navigate = useNavigate()
  const { signIn, user, profile, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const justSignedInRef = useRef(false)

  // Redirect after successful sign-in when profile is loaded
  useEffect(() => {
    if (justSignedInRef.current && user && !authLoading) {
      // User just signed in - wait for profile or timeout
      if (profile) {
        // Profile loaded successfully
        justSignedInRef.current = false
        setLoading(false)
        
        if (profile.role === 'host') {
          navigate('/host/dashboard')
        } else if (profile.role === 'applicant') {
          navigate('/applications')
        } else {
          // Fallback if role is null/unknown
          navigate('/')
        }
      } else {
        // Profile is null - might still be loading or failed
        // Wait a bit more, but if it takes too long, redirect anyway
        const timeout = setTimeout(() => {
          if (justSignedInRef.current && user && !profile) {
            justSignedInRef.current = false
            setLoading(false)
            // Redirect to home if profile fetch failed
            navigate('/')
            toast.info('Signed in, but profile information is unavailable')
          }
        }, 5000) // Wait 5 seconds for profile

        return () => clearTimeout(timeout)
      }
    }
  }, [user, profile, authLoading, navigate])

  // If user is already logged in (but didn't just sign in), redirect them away
  useEffect(() => {
    if (user && !authLoading && !justSignedInRef.current) {
      // Only redirect if we have a profile with a role
      if (profile?.role === 'host') {
        navigate('/host/dashboard', { replace: true })
      } else if (profile?.role === 'applicant') {
        navigate('/applications', { replace: true })
      }
      // If no profile or role, stay on sign-in page (might be creating account)
    }
  }, [user, profile, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    justSignedInRef.current = false

    try {
      // Add timeout to prevent hanging (10 seconds)
      const signInPromise = signIn(email, password)
      const timeoutPromise = new Promise<{ error: any }>((resolve) => 
        setTimeout(() => resolve({ error: { message: 'Sign-in request timed out. Please try again.' } }), 10000)
      )

      const result = await Promise.race([signInPromise, timeoutPromise])
      const { error } = result

      if (error) {
        toast.error(error.message || 'Failed to sign in')
        setLoading(false)
        justSignedInRef.current = false
        return
      }

      // Successful sign in - mark that we just signed in
      justSignedInRef.current = true
      toast.success('Signed in successfully')
      
      // Profile will be fetched by AuthContext, and useEffect will handle redirect
      // Set a fallback timeout in case profile fetch hangs
      setTimeout(() => {
        if (justSignedInRef.current && loading) {
          setLoading(false)
          justSignedInRef.current = false
          toast.error('Profile loading timed out. Please refresh the page.')
        }
      }, 15000) // 15 second fallback
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign-in')
      setLoading(false)
      justSignedInRef.current = false
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
            Welcome Back
          </h1>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/auth/sign-up" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignInPage

