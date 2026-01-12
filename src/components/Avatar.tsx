import { useState } from 'react'
import { User } from 'lucide-react'

interface AvatarProps {
  src: string | null | undefined
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
}

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const sizeClass = sizeClasses[size]
  const iconSize = iconSizes[size]

  // Always show placeholder if no src provided or image failed to load - never use mock photos
  if (!src || imageError) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 ${className}`}
        aria-label={alt}
      >
        <User size={iconSize} className="text-gray-400 dark:text-gray-500" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      onError={() => setImageError(true)}
    />
  )
}

export default Avatar

