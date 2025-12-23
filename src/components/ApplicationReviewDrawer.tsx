import { useState, useEffect } from 'react'
import { X, Star, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getHouseById } from '../data/mockHouses'

interface ApplicationReviewDrawerProps {
  open: boolean
  onClose: () => void
  application: any | null
  onStatusChange: (applicationId: string, status: 'Accepted' | 'Rejected') => void
}

// Store for host notes and ratings (in-memory) - keyed by application ID (string or number)
const hostNotes: Record<string, { notes: string; rating: 'Strong' | 'Maybe' | 'Pass' | null }> = {}

function ApplicationReviewDrawer({
  open,
  onClose,
  application,
  onStatusChange,
}: ApplicationReviewDrawerProps) {
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState<'Strong' | 'Maybe' | 'Pass' | null>(null)

  // Load existing notes and rating
  useEffect(() => {
    if (application?.id && hostNotes[application.id]) {
      setNotes(hostNotes[application.id].notes)
      setRating(hostNotes[application.id].rating)
    } else {
      setNotes('')
      setRating(null)
    }
  }, [application])

  const handleSaveNotes = () => {
    if (!application?.id) return
    hostNotes[application.id] = { notes, rating }
    toast.success('Notes saved', {
      description: 'Your private notes have been saved.',
    })
  }

  const handleAccept = () => {
    if (!application?.id) return
    hostNotes[application.id] = { notes, rating }
    onStatusChange(application.id, 'Accepted')
    onClose()
  }

  const handleReject = () => {
    if (!application?.id) return
    hostNotes[application.id] = { notes, rating }
    onStatusChange(application.id, 'Rejected')
    onClose()
  }

  if (!open || !application) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative bg-white dark:bg-slate-900 rounded-t-2xl md:rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col z-50 md:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Review Application
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {application.applicantName} · {application.houseName}
            </p>
          </div>
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
          <div className="space-y-6">
            {/* Application Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Application Details
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                    {application.applicantName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                    {application.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Applied At
                  </label>
                  <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                    {new Date(application.appliedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                      application.status === 'Accepted'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : application.status === 'Rejected'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}
                  >
                    {application.status}
                  </span>
                </div>
                {/* Show full application data if available */}
                {application.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone
                      </label>
                      <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                        {application.phone}
                      </p>
                    </div>
                )}
                {application.linkedin && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        LinkedIn
                      </label>
                      <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                        <a href={application.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {application.linkedin}
                        </a>
                      </p>
                    </div>
                )}
                {application.portfolio && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Portfolio
                      </label>
                      <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                        <a href={application.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {application.portfolio}
                        </a>
                      </p>
                    </div>
                )}
                {application.current_role && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Role
                      </label>
                      <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                        {application.current_role}
                      </p>
                    </div>
                )}
                {application.company && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company/School
                      </label>
                      <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                        {application.company}
                      </p>
                    </div>
                )}
                {application.skills && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Skills
                      </label>
                      <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                        {application.skills}
                      </p>
                    </div>
                )}
                {application.building_what && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        What are you building?
                      </label>
                      <p className="text-base text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">
                        {application.building_what}
                      </p>
                    </div>
                )}
                {application.why_this_house && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Why this hacker house?
                      </label>
                      <p className="text-base text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">
                        {application.why_this_house}
                      </p>
                    </div>
                )}
                {application.duration_preference && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Duration Preference
                      </label>
                      <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                        {application.duration_preference}
                      </p>
                    </div>
                )}
                {application.custom_answers && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Custom Questions
                        </label>
                        <div className="mt-2 space-y-3">
                          {Object.entries(application.custom_answers).map(
                            ([question, answer]: [string, any]) => (
                              <div key={question}>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {question}
                                </p>
                                <p className="text-base text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">
                                  {answer}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                )}
              </div>
            </div>

            {/* Host Notes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Private Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Add private notes about this applicant..."
              />
              <button
                onClick={handleSaveNotes}
                className="mt-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Save Notes
              </button>
            </div>

            {/* Internal Rating */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Internal Rating
              </h3>
              <div className="flex gap-3">
                {(['Strong', 'Maybe', 'Pass'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setRating(option)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      rating === option
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
          {application.status === 'Pending' && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <XCircle size={18} />
                Reject
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Accept
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApplicationReviewDrawer
