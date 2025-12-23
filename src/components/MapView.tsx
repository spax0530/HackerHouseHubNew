import type { HouseTheme } from '../context/AppContext'

interface House {
  id: number
  name: string
  city: string
  state?: string
  theme: HouseTheme
  price: string
  duration: string
  capacity?: number
  status?: 'Recruiting Now' | 'Full' | 'Closed'
  image: string
}

interface MapViewProps {
  houses: House[]
}

function MapView({ houses }: MapViewProps) {
  return (
    <div className="w-full h-[600px] rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Placeholder grid background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
      
      {/* Placeholder content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Map view coming soon
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {houses.length} houses to display
          </p>
        </div>
      </div>
    </div>
  )
}

export default MapView

