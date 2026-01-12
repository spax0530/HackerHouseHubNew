import { X } from 'lucide-react'
import { HouseFormData } from './AddHouseWizard'

interface HousePreviewModalProps {
  open: boolean
  onClose: () => void
  formData: HouseFormData & { theme: string }
}

function HousePreviewModal({ open, onClose, formData }: HousePreviewModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col z-50 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Preview Your Listing
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Images */}
          {formData.imagePreviews.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                {formData.imagePreviews.slice(0, 4).map((preview, index) => (
                  <div
                    key={index}
                    className={`relative ${index === 0 ? 'col-span-2' : ''} h-64 rounded-lg overflow-hidden`}
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {formData.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {formData.city}, {formData.state}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                {formData.theme}
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">
                {formData.capacity} residents
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">
                ${formData.pricePerMonth === 0 ? 'Free' : `${formData.pricePerMonth}/mo`}
              </span>
            </div>
          </div>

          {/* Description */}
          {formData.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                About
              </h2>
              <div
                className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: formData.description }}
              />
            </div>
          )}

          {/* Highlights */}
          {formData.highlights && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Highlights
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {formData.highlights.split('\n').filter(h => h.trim()).map((highlight, index) => (
                  <li key={index}>{highlight.trim()}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Amenities */}
          {formData.amenities.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Duration
              </h3>
              <p className="text-gray-900 dark:text-gray-100">{formData.duration}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Status
              </h3>
              <p className="text-gray-900 dark:text-gray-100">{formData.status}</p>
            </div>
          </div>

          {/* Application Link */}
          {formData.applicationLink && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Application Link
              </h3>
              <a
                href={formData.applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {formData.applicationLink}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}

export default HousePreviewModal

