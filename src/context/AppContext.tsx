import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

export type Theme = 'light' | 'dark'
export type HouseTheme = 'AI' | 'Climate' | 'Hardware' | 'Crypto' | 'General Startup'

export interface Favorite {
  id: number
  name: string
  city: string
  theme: HouseTheme
  price: string
  image: string
}

interface AppContextType {
  // UI State
  darkMode: boolean
  toggleDarkMode: () => void
  favorites: Favorite[]
  addFavorite: (house: Favorite) => void
  removeFavorite: (id: number) => void
  isFavorite: (id: number) => boolean
  comparison: Favorite[]
  addToComparison: (house: Favorite) => void
  removeFromComparison: (id: number) => void
  clearComparison: () => void
  isInComparison: (id: number) => boolean
  showApplicationModal: boolean
  setShowApplicationModal: (show: boolean) => void
  selectedHouse: Favorite | null
  setSelectedHouse: (house: Favorite | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  // UI state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('hackerhousehub_darkMode')
    return stored ? JSON.parse(stored) : false
  })

  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    // Initial load from local storage to prevent flicker
    // Will be overwritten by Supabase if user is logged in
    const stored = localStorage.getItem('hackerhousehub_favorites')
    return stored ? JSON.parse(stored) : []
  })

  const [comparison, setComparison] = useState<Favorite[]>([])
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState<Favorite | null>(null)

  // Sync dark mode with localStorage and document class
  useEffect(() => {
    localStorage.setItem('hackerhousehub_darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Sync favorites with Supabase when user is logged in
  useEffect(() => {
    if (!user) {
      // If not logged in, stick to local storage (already loaded in initial state)
      // or optionally clear favorites if we want strict separation
      return
    }

    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from('saved_houses')
        .select('house_id, houses(*)')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching favorites:', error)
        return
      }

      if (data) {
        // Transform Supabase response to Favorite type
        const remoteFavorites = data.map((item: any) => {
          const h = item.houses
          return {
            id: h.id,
            name: h.name,
            city: h.city,
            theme: h.theme as HouseTheme,
            price: `$${h.price_per_month}/mo`,
            image: h.images?.[0] || h.image || '', // Handle legacy/new image structure
          }
        })
        setFavorites(remoteFavorites)
      }
    }

    fetchFavorites()
  }, [user])

  // Sync favorites with localStorage (for persistence across reloads if not using Supabase, or as backup)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('hackerhousehub_favorites', JSON.stringify(favorites))
    }
  }, [favorites, user])

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [])

  const addFavorite = useCallback(async (house: Favorite) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === house.id)) {
        return prev
      }
      return [...prev, house]
    })

    if (user) {
      // Sync to Supabase
      const { error } = await supabase
        .from('saved_houses')
        .insert({ user_id: user.id, house_id: house.id })
      
      if (error) {
        toast.error('Failed to save to favorites')
        // Revert local state if needed? For now we trust optimistic UI
      }
    } else {
        toast('House saved to favorites', {
            description: 'Sign in to sync your favorites across devices.'
        })
    }
  }, [user])

  const removeFavorite = useCallback(async (id: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id))

    if (user) {
      // Sync to Supabase
      const { error } = await supabase
        .from('saved_houses')
        .delete()
        .eq('user_id', user.id)
        .eq('house_id', id)
        
      if (error) {
        toast.error('Failed to remove from favorites')
      }
    }
  }, [user])

  const isFavorite = useCallback(
    (id: number) => {
      return favorites.some((f) => f.id === id)
    },
    [favorites]
  )

  const addToComparison = useCallback((house: Favorite) => {
    setComparison((prev) => {
      if (prev.length >= 4) {
        return prev
      }
      if (prev.some((h) => h.id === house.id)) {
        return prev
      }
      return [...prev, house]
    })
  }, [])

  const removeFromComparison = useCallback((id: number) => {
    setComparison((prev) => prev.filter((h) => h.id !== id))
  }, [])

  const clearComparison = useCallback(() => {
    setComparison([])
  }, [])

  const isInComparison = useCallback(
    (id: number) => {
      return comparison.some((h) => h.id === id)
    },
    [comparison]
  )

  const value: AppContextType = {
    // UI
    darkMode,
    toggleDarkMode,
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    comparison,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    showApplicationModal,
    setShowApplicationModal,
    selectedHouse,
    setSelectedHouse,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
