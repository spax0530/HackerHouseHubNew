import { useState } from 'react'
import { ArrowLeft, ArrowRight, Heart, Plus, Share2 } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'

interface HouseImageCarouselProps {
  images: string[]
  houseId: number
  houseName: string
  houseCity: string
  houseTheme: string
  housePrice: string
}

function HouseImageCarousel({
  images,
  houseId,
  houseName,
  houseCity,
  houseTheme,
  housePrice,
}: HouseImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const {
    isFavorite,
    addFavorite,
    removeFavorite,
    isInComparison,
    addToComparison,
    removeFromComparison,
  } = useAppContext()

  const favorite = isFavorite(houseId)
  const inComparison = isInComparison(houseId)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const handleFavoriteClick = () => {
    if (favorite) {
      removeFavorite(houseId)
    } else {
      addFavorite({
        id: houseId,
        name: houseName,
        city: houseCity,
        theme: houseTheme as any,
        price: housePrice,
        image: images[0],
      })
    }
  }

  const handleComparisonClick = () => {
    if (inComparison) {
      removeFromComparison(houseId)
    } else {
      addToComparison({
        id: houseId,
        name: houseName,
        city: houseCity,
        theme: houseTheme as any,
        price: housePrice,
        image: images[0],
      })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: houseName,
        text: `Check out ${houseName} on HackerHouseHub`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (images.length === 0) return null

  return (
    <div className="relative w-full h-[260px] md:h-[400px] lg:h-[500px] overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-b-2xl">
      {/* Main Image */}
      <img
        src={images[currentIndex]}
        alt={`${houseName} - Image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Gradient Overlay for Controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

      {/* Action Buttons (Top Right) */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={handleFavoriteClick}
          className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
            favorite
              ? 'bg-red-500 text-white'
              : 'bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
          }`}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={handleComparisonClick}
          className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
            inComparison
              ? 'bg-blue-500 text-white'
              : 'bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
          }`}
          aria-label={inComparison ? 'Remove from comparison' : 'Add to comparison'}
        >
          <Plus size={20} fill={inComparison ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={handleShare}
          className="p-2.5 rounded-full backdrop-blur-md bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
          aria-label="Share"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full backdrop-blur-md bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
            aria-label="Previous image"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full backdrop-blur-md bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
            aria-label="Next image"
          >
            <ArrowRight size={20} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HouseImageCarousel

