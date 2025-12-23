import { ExternalLink, X } from 'lucide-react'

interface ExternalLinkWarningModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  externalLink: string
  houseName: string
}

function ExternalLinkWarningModal({
  open,
  onClose,
  onConfirm,
  externalLink,
  houseName,
}: ExternalLinkWarningModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <ExternalLink size={24} />
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Leaving HackerHouseHub
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You are about to visit an external application page for <span className="font-semibold">{houseName}</span>. 
            We are not responsible for the content or privacy practices of external sites.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Continue to Application
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExternalLinkWarningModal

