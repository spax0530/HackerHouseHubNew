import { X } from 'lucide-react'
import FilterSidebar from './FilterSidebar'

interface FilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  selectedLocations: string[]
  setSelectedLocations: (locs: string[]) => void
  selectedThemes: string[]
  setSelectedThemes: (themes: string[]) => void
  priceRange: string
  setPriceRange: (value: string) => void
  duration: string
  setDuration: (value: string) => void
  capacity: number
  setCapacity: (value: number) => void
  status: string[]
  setStatus: (values: string[]) => void
  onClearAll: () => void
}

function FilterDrawer({
  isOpen,
  onClose,
  selectedLocations,
  setSelectedLocations,
  selectedThemes,
  setSelectedThemes,
  priceRange,
  setPriceRange,
  duration,
  setDuration,
  capacity,
  setCapacity,
  status,
  setStatus,
  onClearAll,
}: FilterDrawerProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-xl z-50 transform transition-transform overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <FilterSidebar
            selectedLocations={selectedLocations}
            setSelectedLocations={setSelectedLocations}
            selectedThemes={selectedThemes}
            setSelectedThemes={setSelectedThemes}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            duration={duration}
            setDuration={setDuration}
            capacity={capacity}
            setCapacity={setCapacity}
            status={status}
            setStatus={setStatus}
            onClearAll={onClearAll}
          />
        </div>
      </div>
    </>
  )
}

export default FilterDrawer

