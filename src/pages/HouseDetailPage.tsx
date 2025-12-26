import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  MapPin,
  Wifi,
  UtensilsCrossed,
  Car,
  Users,
  Coffee,
  Zap,
  Home,
  Shield,
  Calendar,
  CheckCircle,
  MessageCircle,
} from 'lucide-react'
import HouseImageCarousel from '../components/house/HouseImageCarousel'
import ResidentsSection from '../components/house/ResidentsSection'
import HouseCard from '../components/HouseCard'
import EmptyState from '../components/EmptyState'
import MapView from '../components/MapView'
import ApplicationModal from '../components/ApplicationModal'
import ExternalLinkWarningModal from '../components/ExternalLinkWarningModal'
import { useAppContext, type HouseTheme } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

interface Resident {
  id: number
  name: string
  role: string
  bio: string
  avatar: string
  linkedin?: string
  twitter?: string
}

// Reviews feature removed

interface Host {
  name: string
  avatar: string
  verified: boolean
  responseTime: string
  hostedSince: string
  bio: string
}

interface Location {
  lat: number
  lng: number
  address: string
  neighborhood: string
}

interface SimilarHouse {
  id: number
  name: string
  city: string
  state: string
  theme: HouseTheme
  price: string
  duration: string
  capacity: number
  status: 'Recruiting Now' | 'Full' | 'Closed'
  image: string
}

interface HouseDetail {
  id: number
  slug?: string | null // SEO-friendly URL slug
  name: string
  city: string
  state: string
  theme: HouseTheme
  pricePerMonth: number
  duration: string
  capacity: number
  status: 'Recruiting Now' | 'Full' | 'Closed'
  images: string[]
  description: string
  amenities: string[]
  highlights: string[]
  customQuestions?: string[]
  applicationLink?: string
  residents: Resident[]
  host: Host
  location: Location
  similarHouses: SimilarHouse[]
}

const themeColors: Record<HouseTheme, string> = {
  AI: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Climate: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  Hardware: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  Crypto: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'General Startup': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
}

import type { LucideIcon } from 'lucide-react'

const amenityIcons: Record<string, LucideIcon> = {
  'High-speed WiFi': Wifi,
  'Fully equipped kitchen': UtensilsCrossed,
  'Parking available': Car,
  'Dedicated workspace': Home,
  'Private bedrooms': Shield,
  'Coffee station': Coffee,
  'Gym access': Zap,
  'Rooftop terrace': Home,
}

function HouseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { showApplicationModal, setShowApplicationModal, selectedHouse, setSelectedHouse } = useAppContext()
  const { user, profile } = useAuth()
  const [externalLinkWarningOpen, setExternalLinkWarningOpen] = useState(false)
  
  const [house, setHouse] = useState<HouseDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHouse = async () => {
      if (!slug) return
      
      try {
        setLoading(true)
        // Try to fetch by slug first (SEO-friendly), fallback to ID for backwards compatibility
        const isNumeric = /^\d+$/.test(slug)
        let query = supabase
          .from('houses')
          .select('*, host:profiles(full_name, avatar_url, bio)')
          .eq('admin_status', 'approved') // Only show approved houses
        
        if (isNumeric) {
          // Backwards compatibility: if slug is numeric, treat as ID
          query = query.eq('id', parseInt(slug))
        } else {
          // SEO-friendly: use slug
          query = query.eq('slug', slug)
        }
        
        const { data, error } = await query.single()

        if (error) throw error

        if (data) {
          // Transform data
          // Mock data for things we don't have yet (residents, reviews, precise location)
          const detail: HouseDetail = {
            id: data.id,
            slug: data.slug || null,
            name: data.name,
            city: data.city,
            state: data.state,
            theme: data.theme as HouseTheme,
            pricePerMonth: data.price_per_month,
            duration: data.duration,
            capacity: data.capacity,
            status: data.status,
            images: data.images || [],
            description: data.description || '',
            amenities: data.amenities || [],
            highlights: data.highlights || [],
            applicationLink: data.application_link || undefined,
            residents: [],
            host: {
              name: data.host?.full_name || 'Host',
              avatar: data.host?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              verified: false,
              responseTime: 'within 24 hours',
              hostedSince: new Date(data.created_at).getFullYear().toString(),
              bio: data.host?.bio || 'Community builder passionate about fostering innovation.',
            },
            location: {
              lat: 0,
              lng: 0,
              address: `${data.city}, ${data.state}`,
              neighborhood: data.city,
            },
            similarHouses: [],
          }
          setHouse(detail)
        }
      } catch (error) {
        console.error('Error fetching house:', error)
        setHouse(null)
      } finally {
        setLoading(false)
      }
    }

    fetchHouse()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  if (!house) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <EmptyState
          title="House not found"
          description="The house you're looking for doesn't exist or has been removed."
        />
      </div>
    )
  }

  const handleApplyNow = () => {
    // Check if user is authenticated and is an applicant
    if (!user) {
      toast.error('Create a builder account to apply')
      navigate('/auth/sign-in', { state: { from: `/house/${house.slug || house.id}` } })
      return
    }
    
    if (profile?.role !== 'applicant') {
      toast.error('Only builders can apply to houses. Please sign in as a builder.')
      return
    }

    // Check if house has external application link
    if (house.applicationLink) {
      setExternalLinkWarningOpen(true)
      return
    }

    // Default internal flow
    setSelectedHouse({
      id: house.id,
      name: house.name,
      city: house.city,
      theme: house.theme,
      price: `$${house.pricePerMonth}/mo`,
      image: house.images[0] || '',
    })
    setShowApplicationModal(true)
  }

  const handleConfirmExternalLink = () => {
    if (house.applicationLink) {
      window.open(house.applicationLink, '_blank')
      setExternalLinkWarningOpen(false)
    }
  }

  const handleContactHost = () => {
    toast.info('Host messaging coming soon', {
      description: 'Direct messaging with hosts will be available soon.',
    })
  }

  const handleMessageHost = () => {
    // TODO: Open message host modal
    console.log('Message host')
  }

  const getAmenityIcon = (amenity: string) => {
    for (const [key, Icon] of Object.entries(amenityIcons)) {
      if (amenity.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
        return Icon
      }
    }
    return CheckCircle
  }

  // Reviews feature removed

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Image Carousel */}
      <HouseImageCarousel
        images={house.images}
        houseId={house.id}
        houseName={house.name}
        houseCity={house.city}
        houseTheme={house.theme}
        housePrice={`$${house.pricePerMonth}/mo`}
      />

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-10">
          {/* Main Content */}
          <div className="min-w-0">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {house.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <MapPin size={18} />
                  <span className="text-base">
                    {house.location.neighborhood}, {house.city}, {house.state}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${themeColors[house.theme]}`}
                >
                  {house.theme}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    house.status === 'Recruiting Now'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {house.status}
                </span>
              </div>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Users size={16} />
                  <span>Up to {house.capacity} residents</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  <span>Typical stay: {house.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={16} />
                  <span>{house.theme} Builders</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <section className="py-6 md:py-8 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                About this house
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {house.description.split('\n\n').map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {/* Amenities */}
            <section className="py-6 md:py-8 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Amenities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {house.amenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity)
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
                    >
                      <Icon size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <span className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                        {amenity}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Highlights */}
            <section className="py-6 md:py-8 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                What you'll work on
              </h2>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30">
                <ul className="space-y-3">
                  {house.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle
                        size={20}
                        className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-base text-gray-700 dark:text-gray-300">
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Residents */}
            <ResidentsSection residents={house.residents} />

            {/* Location Map */}
            <section className="py-6 md:py-8 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Location
              </h2>
              <div className="mb-4">
                <p className="text-base text-gray-700 dark:text-gray-300 mb-1">
                  {house.location.neighborhood}, {house.city}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{house.location.address}</p>
              </div>
              <div className="h-[320px] md:h-[400px] rounded-xl overflow-hidden">
                <MapView houses={[house as any]} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Exact address shared after acceptance
              </p>
            </section>

            {/* Reviews section removed */}

            {/* Similar Houses */}
            {house.similarHouses && house.similarHouses.length > 0 ? (
              <section className="py-6 md:py-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Similar houses you might like
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {house.similarHouses.map((similarHouse) => (
                    <HouseCard key={similarHouse.id} {...similarHouse} showComparison />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit mt-8 lg:mt-0">
            <div className="space-y-6">
              {/* Booking Card */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm p-6">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      ${house.pricePerMonth}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/ month</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Typical stay: {house.duration}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      house.status === 'Recruiting Now'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {house.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={handleApplyNow}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Apply Now
                  </button>
                  <button
                    onClick={handleContactHost}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    Contact Host
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Key amenities
                  </p>
                  <ul className="space-y-2">
                    {house.amenities.slice(0, 4).map((amenity) => (
                      <li key={amenity} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Host Card */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={house.host.avatar}
                    alt={house.host.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {house.host.name}
                      </h3>
                      {house.host.verified && (
                        <CheckCircle
                          size={18}
                          className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Hosted since {house.host.hostedSince}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Responds in {house.host.responseTime}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {house.host.bio}
                </p>
                <button
                  onClick={handleMessageHost}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Message Host
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <ApplicationModal
        open={showApplicationModal}
        onOpenChange={setShowApplicationModal}
        house={
          selectedHouse && house
            ? {
                id: selectedHouse.id,
                name: selectedHouse.name,
                city: selectedHouse.city,
                theme: selectedHouse.theme,
                customQuestions: house.customQuestions,
              }
            : null
        }
      />
      
      {/* External Link Warning Modal */}
      <ExternalLinkWarningModal
        open={externalLinkWarningOpen}
        onClose={() => setExternalLinkWarningOpen(false)}
        onConfirm={handleConfirmExternalLink}
        externalLink={house.applicationLink || ''}
        houseName={house.name}
      />
    </div>
  )
}

export default HouseDetailPage
