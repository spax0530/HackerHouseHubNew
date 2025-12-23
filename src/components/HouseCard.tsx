import { useNavigate } from 'react-router-dom'
import { Heart, Plus, MapPin, DollarSign, Calendar, Users } from 'lucide-react'
import { useAppContext, type HouseTheme } from '../context/AppContext'

interface HouseCardProps {
  id: number
  image: string
  name: string
  city: string
  state?: string
  theme: HouseTheme
  price: string
  duration: string
  capacity?: number
  status?: 'Recruiting Now' | 'Full' | 'Closed'
  onViewDetails?: () => void
  showComparison?: boolean
}

const themeColors: Record<HouseTheme, string> = {
  AI: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  Climate: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  Hardware: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  Crypto: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'General Startup': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
}

function HouseCard({
  id,
  image,
  name,
  city,
  state,
  theme,
  price,
  duration,
  capacity,
  status,
  onViewDetails,
  showComparison = false,
}: HouseCardProps) {
  const navigate = useNavigate()
  const {
    isFavorite,
    addFavorite,
    removeFavorite,
    isInComparison,
    addToComparison,
    removeFromComparison,
  } = useAppContext()

  const favorite = isFavorite(id)
  const inComparison = isInComparison(id)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (favorite) {
      removeFavorite(id)
    } else {
      addFavorite({
        id,
        name,
        city,
        theme,
        price,
        image,
      })
    }
  }

  const handleComparisonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inComparison) {
      removeFromComparison(id)
    } else {
      addToComparison({
        id,
        name,
        city,
        theme,
        price,
        image,
      })
    }
  }

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails()
    } else {
      navigate(`/house/${id}`)
    }
  }

  const statusColors = {
    'Recruiting Now': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    Full: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    Closed: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 dark:border-gray-800">
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        
        {/* Status Badge */}
        {status && (
          <div className="absolute top-3 left-3">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
            >
              {status}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
              favorite
                ? 'bg-red-500 text-white'
                : 'bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
            }`}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
          </button>

          {showComparison && (
            <button
              onClick={handleComparisonClick}
              className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                inComparison
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
              }`}
              aria-label={inComparison ? 'Remove from comparison' : 'Add to comparison'}
            >
              <Plus size={16} fill={inComparison ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 md:p-5 space-y-2.5 md:space-y-3">
        {/* Name and Theme */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100 flex-1 leading-tight">{name}</h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${themeColors[theme]}`}
          >
            {theme}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
          <MapPin size={14} />
          <span>
            {city}
            {state && `, ${state}`}
          </span>
        </div>

        {/* Price and Duration */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} />
            <span>{price}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{duration}</span>
          </div>
        </div>

        {/* Capacity */}
        {capacity && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <Users size={14} />
            <span>{capacity} residents</span>
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={handleViewDetails}
          className="w-full mt-3 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          View House →
        </button>
      </div>
    </div>
  )
}

export default HouseCard
