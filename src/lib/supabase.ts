import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create supabase client with fallback empty strings to prevent crash
// The app will show errors when trying to use Supabase if env vars are missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

// Export a check function to verify env vars are set
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co')
}

// Database types
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: 'applicant' | 'host' | 'admin' | null
  avatar_url: string | null
  bio: string | null
  linkedin_url: string | null
  github_url: string | null
  website_url: string | null
  created_at: string
  updated_at: string
}

export interface House {
  id: number
  host_id: string
  name: string
  slug: string | null // SEO-friendly URL slug
  city: string
  state: string
  theme: string
  price_per_month: number
  duration: string
  capacity: number
  status: 'Recruiting Now' | 'Full' | 'Closed'
  admin_status: 'pending' | 'approved' | 'rejected' | 'paused' // Admin verification status
  description: string | null
  amenities: string[] | null
  highlights: string[] | null
  application_link: string | null
  images: string[] | null
  featured: boolean
  impressions: number
  applications_count: number
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  house_id: number
  applicant_id: string
  applicant_name: string
  email: string
  phone: string | null
  linkedin: string | null
  portfolio: string | null
  current_role: string | null
  company: string | null
  skills: string | null
  years_experience: number | null
  building_what: string | null
  why_this_house: string | null
  duration_preference: string | null
  move_in_date: string | null
  custom_answers: Record<string, string> | null
  status: 'Pending' | 'Accepted' | 'Rejected'
  created_at: string
  updated_at: string
}

export interface SavedHouse {
  id: number
  user_id: string
  house_id: number
  created_at: string
}
