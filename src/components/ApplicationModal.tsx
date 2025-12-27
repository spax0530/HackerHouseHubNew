import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { submitApplication } from '../lib/applications'
import { useAuth } from '../context/AuthContext'

// Mock applications store (in-memory) for backward compatibility
export const mockApplications: Array<{
  id: number
  houseId: number
  houseName: string
  applicantName: string
  email: string
  appliedAt: string
  status: 'Pending' | 'Accepted' | 'Rejected'
  fullName?: string
  phone?: string
  linkedin?: string
  portfolio?: string
  currentRole?: string
  company?: string
  skills?: string
  yearsExperience?: number
  buildingWhat?: string
  whyThisHouse?: string
  durationPreference?: string
  moveInDate?: string
  customAnswers?: Record<string, string>
}> = []

interface ApplicationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  house: { id: number; name: string; city: string; theme: string; customQuestions?: string[] } | null
}

interface ApplicationData {
  // Step 1
  fullName: string
  email: string
  phone: string
  linkedin: string
  portfolio: string
  // Step 2
  currentRole: string
  company: string
  skills: string
  yearsExperience: number
  // Step 3
  buildingWhat: string
  whyThisHouse: string
  durationPreference: string
  moveInDate: string
  // Custom questions
  customAnswers: Record<string, string>
}

function ApplicationModal({ open, onOpenChange, house }: ApplicationModalProps) {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ApplicationData>({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    currentRole: '',
    company: '',
    skills: '',
    yearsExperience: 0,
    buildingWhat: '',
    whyThisHouse: '',
    durationPreference: '',
    moveInDate: '',
    customAnswers: {},
  })

  // Pre-fill user data when modal opens or profile changes
  useEffect(() => {
    if (user && open) {
      setFormData(prev => ({
        ...prev,
        fullName: profile?.full_name || prev.fullName,
        email: profile?.email || user.email || prev.email,
        linkedin: profile?.linkedin_url || prev.linkedin,
        portfolio: profile?.website_url || prev.portfolio,
      }))
    }
  }, [user, profile, open])

  // Initialize custom answers when house changes
  useEffect(() => {
    if (house?.customQuestions) {
      const initialAnswers: Record<string, string> = {}
      house.customQuestions.forEach((q) => {
        initialAnswers[q] = ''
      })
      setFormData((prev) => ({ ...prev, customAnswers: initialAnswers }))
    } else {
      setFormData((prev) => ({ ...prev, customAnswers: {} }))
    }
  }, [house])

  // Reset form when modal closes (except pre-filled data if user is logged in, we can keep that or reset fully)
  useEffect(() => {
    if (!open) {
      setCurrentStep(1)
      setFormData({
        fullName: profile?.full_name || '',
        email: profile?.email || user?.email || '',
        phone: '',
        linkedin: profile?.linkedin_url || '',
        portfolio: profile?.website_url || '',
        currentRole: '',
        company: '',
        skills: '',
        yearsExperience: 0,
        buildingWhat: '',
        whyThisHouse: '',
        durationPreference: '',
        moveInDate: '',
        customAnswers: {},
      })
    }
  }, [open, profile, user])

  const updateField = (field: keyof ApplicationData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          formData.fullName.trim() !== '' &&
          formData.email.trim() !== '' &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
          formData.phone.trim() !== ''
        )
      case 2:
        return formData.currentRole.trim() !== '' && formData.skills.trim() !== ''
      case 3:
        const hasRequiredCustomAnswers =
          !house?.customQuestions ||
          house.customQuestions.every((q) => formData.customAnswers[q]?.trim() !== '')
        return (
          formData.buildingWhat.trim() !== '' &&
          formData.whyThisHouse.trim() !== '' &&
          formData.durationPreference !== '' &&
          hasRequiredCustomAnswers
        )
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!house || !user) return

    setIsSubmitting(true)

    try {
      console.log('Submitting application for user:', user.id, 'house:', house.id)
      
      const result = await submitApplication({
        houseId: house.id,
        applicantId: user.id,
        applicantName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        linkedin: formData.linkedin,
        portfolio: formData.portfolio,
        currentRole: formData.currentRole,
        company: formData.company,
        skills: formData.skills,
        yearsExperience: formData.yearsExperience,
        buildingWhat: formData.buildingWhat,
        whyThisHouse: formData.whyThisHouse,
        durationPreference: formData.durationPreference,
        moveInDate: formData.moveInDate,
        customAnswers: Object.keys(formData.customAnswers).length > 0 ? formData.customAnswers : undefined,
      })

      if (!result.success) {
        console.error('Application submission failed:', result.error)
        throw result.error || new Error('Failed to submit application')
      }
      
      console.log('Application submitted successfully:', result.data)

      toast.success('Application submitted successfully!', {
        description: `We'll notify the host of your interest in ${house.name}.`,
      })

      setIsSubmitting(false)
      onOpenChange(false)
      
      // Navigate to applications page after a short delay
      setTimeout(() => {
        navigate('/applications')
      }, 1000)
    } catch (error: any) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application', {
        description: error.message || 'Please try again later.',
      })
      setIsSubmitting(false)
    }
  }

  if (!open || !house) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col z-50 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Apply to {house.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{house.city}</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === currentStep
                        ? 'bg-blue-600 text-white'
                        : step < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle size={16} /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`h-1 w-full mx-2 ${
                        step < currentStep
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-800'
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Personal Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn (optional)
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Portfolio/Website (optional)
                </label>
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => updateField('portfolio', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://johndoe.com"
                />
              </div>
            </div>
          )}

          {/* Step 2: Background */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Background
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.currentRole}
                  onChange={(e) => updateField('currentRole', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company/School (optional)
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Google / Stanford"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skills <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => updateField('skills', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="React, TypeScript, Machine Learning, Python..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Years of Experience (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.yearsExperience || ''}
                  onChange={(e) => updateField('yearsExperience', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5"
                />
              </div>
            </div>
          )}

          {/* Step 3: Project & Goals */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Project & Goals
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What are you building? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.buildingWhat}
                  onChange={(e) => updateField('buildingWhat', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe your project or startup..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Why this hacker house? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.whyThisHouse}
                  onChange={(e) => updateField('whyThisHouse', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Why are you interested in this specific house?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration Preference <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.durationPreference}
                  onChange={(e) => updateField('durationPreference', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select duration</option>
                  <option value="1-3">1-3 months</option>
                  <option value="3-6">3-6 months</option>
                  <option value="6-12">6-12 months</option>
                  <option value="12+">12+ months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Move-in Date (optional)
                </label>
                <input
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) => updateField('moveInDate', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Custom Questions */}
              {house?.customQuestions && house.customQuestions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Additional Questions
                  </h4>
                  <div className="space-y-4">
                    {house.customQuestions.map((question, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {question} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.customAnswers[question] || ''}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              customAnswers: {
                                ...prev.customAnswers,
                                [question]: e.target.value,
                              },
                            }))
                          }}
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Your answer..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Review & Submit
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {house.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{house.city}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Personal Information
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Name: {formData.fullName}</p>
                    <p>Email: {formData.email}</p>
                    <p>Phone: {formData.phone}</p>
                    {formData.linkedin && <p>LinkedIn: {formData.linkedin}</p>}
                    {formData.portfolio && <p>Portfolio: {formData.portfolio}</p>}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Background</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Role: {formData.currentRole}</p>
                    {formData.company && <p>Company: {formData.company}</p>}
                    <p>Skills: {formData.skills}</p>
                    {formData.yearsExperience > 0 && (
                      <p>Experience: {formData.yearsExperience} years</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Project & Goals
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Building: {formData.buildingWhat}</p>
                    <p>Why this house: {formData.whyThisHouse}</p>
                    <p>Duration: {formData.durationPreference} months</p>
                    {formData.moveInDate && <p>Move-in: {formData.moveInDate}</p>}
                    {house?.customQuestions && house.customQuestions.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Custom Questions:</h5>
                        {house.customQuestions.map((q, idx) => (
                          <p key={idx} className="mb-1">
                            <span className="font-medium">{q}:</span>{' '}
                            {formData.customAnswers[q] || 'Not answered'}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="px-6 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Next
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApplicationModal
