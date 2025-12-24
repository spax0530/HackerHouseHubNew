import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, type Profile } from '../lib/supabase'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUpBuilder: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signUpHost: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth session
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      }
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
        // Ensure loading is set to false even if profile fetch fails
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'applicant' | 'host'
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
        emailRedirectTo: `${window.location.origin}/auth/sign-in`,
      },
    })

    // The trigger handle_new_user() automatically creates a profile when a user signs up
    // So we don't need to manually create it here. If the trigger fails, we can update it.
    if (data?.user) {
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check if profile exists, if not, create it (fallback)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // Profile wasn't created by trigger, create it manually
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            role: role
          })

        if (profileError && !profileError.message?.includes('duplicate')) {
          console.error('Error creating profile:', profileError)
          return { error: profileError }
        }
      } else {
        // Profile exists, update it with the role if needed
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email: email,
            full_name: fullName,
            role: role
          })
          .eq('id', data.user.id)

        if (updateError) {
          console.error('Error updating profile:', updateError)
        }
      }

      // If user was created successfully, don't return email error
      // Email confirmation can be handled separately
      if (error && error.message?.includes('email')) {
        // User was created but email failed - this is okay for development
        console.warn('User created but email confirmation failed:', error.message)
        return { error: null } // Return success since user was created
      }
    }

    return { error }
  }

  const signUpBuilder = async (email: string, password: string, fullName: string) => {
    return signUp(email, password, fullName, 'applicant')
  }

  const signUpHost = async (email: string, password: string, fullName: string) => {
    return signUp(email, password, fullName, 'host')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setUser(null)
    toast.success('Signed out successfully')
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUpBuilder,
    signUpHost,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
