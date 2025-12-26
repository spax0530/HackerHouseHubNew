import { useState, useRef, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, CheckCircle, Link as LinkIcon, Upload } from 'lucide-react'
import { toast } from 'sonner'
import type { HouseTheme } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { uploadHouseImage } from '../lib/storage'

interface AddHouseWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onHouseAdded: (house: any) => void
}

interface HouseFormData {
  // Step 1
  name: string
  city: string
  state: string
  theme: HouseTheme | ''
  capacity: number
  // Step 2
  pricePerMonth: number
  duration: string
  status: 'Recruiting Now' | 'Full' | 'Closed'
  // Step 3
  description: string
  highlights: string
  amenities: string[]
  applicationLink: string
  // Step 4
  imageFiles: File[]
  imagePreviews: string[]
}

const availableAmenities = [
  'High-speed WiFi',
  'Fully equipped kitchen',
  'Dedicated workspace',
  'Private bedrooms',
  'Coffee station',
  'Parking available',
  'Gym access',
  'Rooftop terrace',
]

const STORAGE_KEY = 'hackerhousehub_house_form_draft'

function AddHouseWizard({ open, onOpenChange, onHouseAdded }: AddHouseWizardProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const [formData, setFormData] = useState<HouseFormData>({
    name: '',
    city: '',
    state: '',
    theme: '',
    capacity: 0,
    pricePerMonth: 0,
    duration: '',
    status: 'Recruiting Now',
    description: '',
    highlights: '',
    amenities: [],
    applicationLink: '',
    imageFiles: [],
    imagePreviews: [],
  })

  // Restore form data from localStorage on mount or when modal opens
  useEffect(() => {
    if (open && !isInitialized) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          // Restore form data (excluding files which can't be stored)
          setFormData(prev => ({
            ...prev,
            name: parsed.name || prev.name,
            city: parsed.city || prev.city,
            state: parsed.state || prev.state,
            theme: parsed.theme || prev.theme,
            capacity: parsed.capacity || prev.capacity,
            pricePerMonth: parsed.pricePerMonth || prev.pricePerMonth,
            duration: parsed.duration || prev.duration,
            status: parsed.status || prev.status,
            description: parsed.description || prev.description,
            highlights: parsed.highlights || prev.highlights,
            amenities: parsed.amenities || prev.amenities,
            applicationLink: parsed.applicationLink || prev.applicationLink,
            // imageFiles and imagePreviews are intentionally not restored
          }))
          // Restore current step
          if (parsed.currentStep) {
            setCurrentStep(parsed.currentStep)
          }
        }
      } catch (error) {
        console.error('Error restoring form data from localStorage:', error)
      }
      setIsInitialized(true)
    }
  }, [open, isInitialized])

  // Save form data to localStorage whenever it changes (only save when modal is open)
  useEffect(() => {
    if (open && isInitialized) {
      try {
        // Only save serializable data (exclude File objects and blob URLs)
        const dataToSave = {
          name: formData.name,
          city: formData.city,
          state: formData.state,
          theme: formData.theme,
          capacity: formData.capacity,
          pricePerMonth: formData.pricePerMonth,
          duration: formData.duration,
          status: formData.status,
          description: formData.description,
          highlights: formData.highlights,
          amenities: formData.amenities,
          applicationLink: formData.applicationLink,
          currentStep: currentStep,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
      } catch (error) {
        console.error('Error saving form data to localStorage:', error)
      }
    }
  }, [formData, currentStep, open, isInitialized])

  // Clear localStorage when modal is closed (user explicitly closes it)
  useEffect(() => {
    if (!open && isInitialized) {
      // Only clear if user manually closes, not on mount
      // We'll handle clearing on submit separately
    }
  }, [open, isInitialized])

  const updateField = (field: keyof HouseFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      const validFiles = newFiles.filter(file => file.type.startsWith('image/'))
      
      if (validFiles.length !== newFiles.length) {
        toast.error('Only image files are allowed')
      }

      // Limit to 5 images total
      const totalFiles = [...formData.imageFiles, ...validFiles].slice(0, 5)
      
      // Create previews
      const newPreviews = totalFiles.map(file => URL.createObjectURL(file))
      
      // Revoke old previews to avoid memory leaks
      formData.imagePreviews.forEach(url => URL.revokeObjectURL(url))

      setFormData(prev => ({
        ...prev,
        imageFiles: totalFiles,
        imagePreviews: newPreviews
      }))
    }
    // Reset input
    if (fileInputRef.current) {
        fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newFiles = prev.imageFiles.filter((_, i) => i !== index)
      const newPreviews = prev.imagePreviews.filter((_, i) => i !== index)
      return {
        ...prev,
        imageFiles: newFiles,
        imagePreviews: newPreviews
      }
    })
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          formData.name.trim() !== '' &&
          formData.city.trim() !== '' &&
          formData.state.trim() !== '' &&
          formData.theme !== '' &&
          formData.capacity > 0
        )
      case 2:
        return formData.pricePerMonth > 0 && formData.duration !== ''
      case 3:
        return formData.description.trim() !== ''
      case 4:
        return formData.imageFiles.length > 0
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

  const handlePublish = async () => {
    if (!user) {
      toast.error('You must be logged in to publish a house')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Create house record first to get ID (or we could use a temp ID for storage path, but real ID is better)
      // Actually, standard practice is to insert first, then upload, then update with URLs 
      // OR upload to a temp folder then move?
      // Simpler: Upload to `house-images/timestamp-filename` (no house ID folder constraint)
      // or `house-images/hostId/filename`. Let's use the helper which handles it.
      
      // Upload images
      const uploadPromises = formData.imageFiles.map(file => uploadHouseImage(file))
      const imageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[]

      if (imageUrls.length === 0 && formData.imageFiles.length > 0) {
          throw new Error('Failed to upload images')
      }

      const houseData = {
        host_id: user.id,
        name: formData.name,
        city: formData.city,
        state: formData.state,
        theme: formData.theme,
        price_per_month: formData.pricePerMonth,
        duration: formData.duration,
        capacity: formData.capacity,
        status: formData.status,
        admin_status: 'pending', // Explicitly pending
        description: formData.description,
        highlights: formData.highlights.split('\n').filter((h) => h.trim()),
        amenities: formData.amenities,
        images: imageUrls,
        application_link: formData.applicationLink || null,
      }

      // Insert into Supabase
      const { data, error } = await supabase
        .from('houses')
        .insert(houseData)
        .select()
        .single()

      if (error) throw error

      // Notify parent
      onHouseAdded(data)

      toast.success('House submitted for review', {
        description: `${formData.name} will be live once approved.`,
      })

      setIsSubmitting(false)
      
      // Clear localStorage on successful submission
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error('Error clearing localStorage:', error)
      }

      // Reset form
      setCurrentStep(1)
      setFormData({
        name: '',
        city: '',
        state: '',
        theme: '',
        capacity: 0,
        pricePerMonth: 0,
        duration: '',
        status: 'Recruiting Now',
        description: '',
        highlights: '',
        amenities: [],
        applicationLink: '',
        imageFiles: [],
        imagePreviews: [],
      })
      setIsInitialized(false)

      onOpenChange(false)
    } catch (error: any) {
      console.error('Error publishing house:', error)
      toast.error(error.message || 'Failed to publish house')
      setIsSubmitting(false)
    }
  }

  if (!open) return null

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New House</h2>
          <button
            onClick={() => {
              // Don't clear localStorage when closing - user might come back
              onOpenChange(false)
            }}
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
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Basic Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  House Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AI Innovation House"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="San Francisco"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CA"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => updateField('theme', e.target.value as HouseTheme)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select theme</option>
                  <option value="AI">AI</option>
                  <option value="Climate">Climate</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Crypto">Crypto</option>
                  <option value="General Startup">General Startup</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity || ''}
                  onChange={(e) => updateField('capacity', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12"
                />
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Duration */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Pricing & Duration
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricePerMonth || ''}
                    onChange={(e) => updateField('pricePerMonth', parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Typical Duration <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => updateField('duration', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select duration</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="12+ months">12+ months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    updateField('status', e.target.value as 'Recruiting Now' | 'Full' | 'Closed')
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Recruiting Now">Recruiting Now</option>
                  <option value="Full">Full</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Details & Amenities */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Details & Amenities
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe your hacker house..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Highlights (one per line)
                </label>
                <textarea
                  value={formData.highlights}
                  onChange={(e) => updateField('highlights', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Weekly AI research presentations&#10;Access to GPU clusters&#10;Networking events with VCs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availableAmenities.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Application Link
                 </label>
                 <div className="relative">
                   <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input
                     type="url"
                     value={formData.applicationLink}
                     onChange={(e) => updateField('applicationLink', e.target.value)}
                     className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="https://example.com/apply"
                   />
                 </div>
                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                   If provided, applicants will be redirected here instead of using the internal application form.
                 </p>
              </div>
            </div>
          )}

          {/* Step 4: Photos & Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Photos & Review
              </h3>
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Images (Max 5) <span className="text-red-500">*</span>
                </label>
                
                {/* Image Previews */}
                {formData.imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {formData.imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {formData.imageFiles.length < 5 && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <Upload size={24} className="mb-2" />
                      <span className="text-sm font-medium">Click to upload images</span>
                      <span className="text-xs text-gray-400">JPG, PNG, WebP up to 5MB</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Summary</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>
                    <span className="font-medium">Name:</span> {formData.name}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {formData.city}, {formData.state}
                  </p>
                  <p>
                    <span className="font-medium">Theme:</span> {formData.theme}
                  </p>
                  <p>
                    <span className="font-medium">Price:</span> ${formData.pricePerMonth}/mo
                  </p>
                  <p>
                    <span className="font-medium">Capacity:</span> {formData.capacity} residents
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> {formData.status}
                  </p>
                  {formData.applicationLink && (
                    <p>
                      <span className="font-medium">Application Link:</span> {formData.applicationLink}
                    </p>
                  )}
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
              onClick={handlePublish}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Publishing...' : 'Publish House'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddHouseWizard
