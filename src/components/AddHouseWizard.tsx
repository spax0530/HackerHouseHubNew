import { useState, useRef, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, CheckCircle, Link as LinkIcon, Upload, ArrowUp, ArrowDown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { HouseTheme } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase, type House } from '../lib/supabase'
import { uploadHouseImage } from '../lib/storage'

interface AddHouseWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onHouseAdded: (house: any) => void
  editingHouse?: House | null // Optional house to edit
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
  existingImages: string[] // Track which previews are existing URLs (not new uploads)
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

// Helper function to restore form data from localStorage synchronously
const restoreFormData = (): { formData: Partial<HouseFormData>; step: number } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        formData: {
          name: parsed.name || '',
          city: parsed.city || '',
          state: parsed.state || '',
          theme: parsed.theme || '',
          capacity: parsed.capacity || 0,
          pricePerMonth: parsed.pricePerMonth || 0,
          duration: parsed.duration || '',
          status: parsed.status || 'Recruiting Now',
          description: parsed.description || '',
          highlights: parsed.highlights || '',
          amenities: parsed.amenities || [],
          applicationLink: parsed.applicationLink || '',
        },
        step: parsed.currentStep || 1,
      }
    }
  } catch (error) {
    console.error('Error restoring form data from localStorage:', error)
  }
  return {
    formData: {},
    step: 1,
  }
}

function AddHouseWizard({ open, onOpenChange, onHouseAdded, editingHouse }: AddHouseWizardProps) {
  const { user } = useAuth()
  
  // Restore data synchronously on mount
  const restored = restoreFormData()
  const [currentStep, setCurrentStep] = useState(restored.step)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<HouseFormData>({
    name: restored.formData.name || '',
    city: restored.formData.city || '',
    state: restored.formData.state || '',
    theme: (restored.formData.theme as HouseTheme) || '',
    capacity: restored.formData.capacity || 0,
    pricePerMonth: restored.formData.pricePerMonth || 0,
    duration: restored.formData.duration || '',
    status: (restored.formData.status as 'Recruiting Now' | 'Full' | 'Closed') || 'Recruiting Now',
    description: restored.formData.description || '',
    highlights: restored.formData.highlights || '',
    amenities: restored.formData.amenities || [],
    applicationLink: restored.formData.applicationLink || '',
    imageFiles: [],
    imagePreviews: [],
    existingImages: [],
  })

  // Load house data when editing
  useEffect(() => {
    if (open && editingHouse) {
      // Populate form with existing house data
      const existingImages = editingHouse.images || []
      setFormData({
        name: editingHouse.name || '',
        city: editingHouse.city || '',
        state: editingHouse.state || '',
        theme: (editingHouse.theme as HouseTheme) || '',
        capacity: editingHouse.capacity || 0,
        pricePerMonth: editingHouse.price_per_month || 0,
        duration: editingHouse.duration || '',
        status: editingHouse.status || 'Recruiting Now',
        description: editingHouse.description || '',
        highlights: editingHouse.highlights?.join('\n') || '',
        amenities: editingHouse.amenities || [],
        applicationLink: editingHouse.application_link || '',
        imageFiles: [], // New files to upload
        imagePreviews: existingImages, // Existing images as URLs
        existingImages: existingImages, // Track which are existing
      })
      setCurrentStep(1)
      // Clear localStorage when editing (don't want to mix draft with edit)
      localStorage.removeItem(STORAGE_KEY)
    } else if (open && !editingHouse) {
      // When opening for new house, restore from localStorage if available
      const saved = restoreFormData()
      if (saved.formData.name || saved.formData.city) {
        // Only restore if there's actual saved data
        setFormData(prev => ({
          ...prev,
          ...saved.formData,
          imageFiles: [],
          imagePreviews: [],
          existingImages: [],
        }))
        setCurrentStep(saved.step)
      } else {
        // Reset to empty form
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
          existingImages: [],
        })
        setCurrentStep(1)
      }
    }
  }, [open, editingHouse])

  // Save form data to localStorage whenever it changes (only for new houses, not edits)
  useEffect(() => {
    if (open && !editingHouse) {
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
  }, [formData, currentStep, open, editingHouse])

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

  const [customAmenity, setCustomAmenity] = useState('')

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim()
    if (trimmed && !formData.amenities.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, trimmed],
      }))
      setCustomAmenity('')
    }
  }

  const removeCustomAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      const validFiles = newFiles.filter(file => file.type.startsWith('image/'))
      
      if (validFiles.length !== newFiles.length) {
        toast.error('Only image files are allowed')
      }

      // Limit to 5 images total (existing + new)
      const currentTotal = formData.imagePreviews.length
      const remainingSlots = Math.max(0, 5 - currentTotal)
      const filesToAdd = validFiles.slice(0, remainingSlots)
      
      if (filesToAdd.length < validFiles.length) {
        toast.warning(`Only ${remainingSlots} more image(s) can be added (max 5 total)`)
      }

      // Create previews for new files
      const newPreviews = filesToAdd.map(file => URL.createObjectURL(file))
      
      // Combine existing images with new previews
      const allPreviews = [...formData.imagePreviews, ...newPreviews]
      const allFiles = [...formData.imageFiles, ...filesToAdd]

      setFormData(prev => ({
        ...prev,
        imageFiles: allFiles,
        imagePreviews: allPreviews
      }))
    }
    // Reset input
    if (fileInputRef.current) {
        fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => {
      const preview = prev.imagePreviews[index]
      const isExisting = prev.existingImages.includes(preview)
      
      // If it's a new file preview (blob URL), revoke it
      if (!isExisting && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
      
      // Find the corresponding file index (only for new files)
      // Count how many existing images come before this index
      const existingBeforeIndex = prev.existingImages.filter((_, i) => i < index).length
      const newFileIndex = index - existingBeforeIndex
      
      const newFiles = newFileIndex >= 0 
        ? prev.imageFiles.filter((_, i) => i !== newFileIndex)
        : prev.imageFiles
      
      const newPreviews = prev.imagePreviews.filter((_, i) => i !== index)
      const newExisting = prev.existingImages.filter((_, i) => i !== index)
      
      return {
        ...prev,
        imageFiles: newFiles,
        imagePreviews: newPreviews,
        existingImages: newExisting
      }
    })
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= prev.imagePreviews.length) return prev

      const newPreviews: string[] = [...prev.imagePreviews]
      const newExisting: string[] = [...prev.existingImages]
      
      // Swap previews
      const tempPreview = newPreviews[index]
      newPreviews[index] = newPreviews[newIndex]
      newPreviews[newIndex] = tempPreview
      
      // Swap existing flags
      const tempExisting = newExisting[index]
      newExisting[index] = newExisting[newIndex]
      newExisting[newIndex] = tempExisting

      // For files, we need to be more careful since not all previews have files
      const existingCount = prev.existingImages.length
      const newFiles: File[] = [...prev.imageFiles]
      
      // Only swap files if both indices are for new files
      if (index >= existingCount && newIndex >= existingCount) {
        const fileIndex1 = index - existingCount
        const fileIndex2 = newIndex - existingCount
        const tempFile = newFiles[fileIndex1]
        newFiles[fileIndex1] = newFiles[fileIndex2]
        newFiles[fileIndex2] = tempFile
      }

      return {
        ...prev,
        imageFiles: newFiles,
        imagePreviews: newPreviews,
        existingImages: newExisting
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
        return formData.imagePreviews.length > 0 // Allow existing images when editing
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
      // Upload new images (only files that need uploading)
      const uploadResults = await Promise.allSettled(
        formData.imageFiles.map(file => uploadHouseImage(file, undefined, user.id))
      )

      const newImageUrls: string[] = []
      const uploadErrors: string[] = []

      uploadResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          newImageUrls.push(result.value)
        } else {
          const fileName = formData.imageFiles[index]?.name || `image ${index + 1}`
          const errorMsg = result.status === 'rejected' 
            ? result.reason?.message || 'Unknown error'
            : 'Upload failed'
          uploadErrors.push(`${fileName}: ${errorMsg}`)
        }
      })

      // Combine existing images with newly uploaded ones
      // Maintain the order from imagePreviews
      const finalImageUrls = formData.imagePreviews.map(preview => {
        // If it's an existing image (URL), keep it
        if (formData.existingImages.includes(preview)) {
          return preview
        }
        // Otherwise, it's a new upload - find the corresponding URL
        const previewIndex = formData.imagePreviews.indexOf(preview)
        const existingBeforeIndex = formData.existingImages.filter((_, i) => i < previewIndex).length
        const fileIndex = previewIndex - existingBeforeIndex
        return newImageUrls[fileIndex] || preview
      }).filter(url => url && url.startsWith('http')) // Only keep valid HTTP URLs (not blob URLs)

      if (finalImageUrls.length === 0) {
        throw new Error('At least one image is required')
      }

      if (uploadErrors.length > 0 && newImageUrls.length > 0) {
        toast.warning(`Some images failed to upload: ${uploadErrors.join(', ')}`)
      }

      const houseData = {
        name: formData.name,
        city: formData.city,
        state: formData.state,
        theme: formData.theme,
        price_per_month: formData.pricePerMonth,
        duration: formData.duration,
        capacity: formData.capacity,
        status: formData.status,
        description: formData.description,
        highlights: formData.highlights.split('\n').filter((h) => h.trim()),
        amenities: formData.amenities,
        images: finalImageUrls,
        application_link: formData.applicationLink || null,
        updated_at: new Date().toISOString(),
      }

      let data, error

      if (editingHouse) {
        // Update existing house
        const { data: updateData, error: updateError } = await supabase
          .from('houses')
          .update(houseData)
          .eq('id', editingHouse.id)
          .select()
          .single()

        data = updateData
        error = updateError

        if (error) throw error

        toast.success('House updated successfully', {
          description: `${formData.name} has been updated.`,
        })
      } else {
        // Create new house
        const { data: insertData, error: insertError } = await supabase
          .from('houses')
          .insert({
            ...houseData,
            host_id: user.id,
            admin_status: 'pending', // New houses need approval
          })
          .select()
          .single()

        data = insertData
        error = insertError

        if (error) throw error

        toast.success('House submitted for review', {
          description: `${formData.name} will be live once approved.`,
        })
      }

      // Notify parent
      onHouseAdded(data)

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
        existingImages: [],
      })
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error publishing house:', error)
      toast.error(error.message || 'Failed to publish house')
      setIsSubmitting(false)
    }
  }

  // Keep component mounted but hidden to preserve state
  if (!open) {
    return null
  }

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {editingHouse ? 'Edit House' : 'Add New House'}
          </h2>
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
                <div className="grid grid-cols-2 gap-3 mb-4">
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
                
                {/* Custom Amenities */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add Custom Amenity
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAmenity}
                      onChange={(e) => setCustomAmenity(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomAmenity()
                        }
                      }}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Swimming pool, Game room, etc."
                    />
                    <button
                      type="button"
                      onClick={addCustomAmenity}
                      disabled={!customAmenity.trim()}
                      className="px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected Custom Amenities */}
                {formData.amenities.filter(a => !availableAmenities.includes(a)).length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Custom Amenities
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities
                        .filter(a => !availableAmenities.includes(a))
                        .map((amenity) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm"
                          >
                            {amenity}
                            <button
                              type="button"
                              onClick={() => removeCustomAmenity(amenity)}
                              className="hover:text-blue-900 dark:hover:text-blue-100"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
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
                
                {/* Image Previews with Reordering */}
                {formData.imagePreviews.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {formData.imagePreviews.map((preview, index) => (
                      <div 
                        key={index} 
                        className="relative flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 group"
                      >
                        {/* Image Preview */}
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                            {index + 1}
                          </div>
                        </div>
                        
                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveImage(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <ArrowUp size={16} className="text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(index, 'down')}
                            disabled={index === formData.imagePreviews.length - 1}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <ArrowDown size={16} className="text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="ml-auto p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                          title="Remove image"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Drag images up/down to reorder. The first image will be the main photo.
                    </p>
                  </div>
                )}

                {/* Upload Button */}
                {formData.imagePreviews.length < 5 && (
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
              {isSubmitting 
                ? (editingHouse ? 'Updating...' : 'Publishing...') 
                : (editingHouse ? 'Update House' : 'Publish House')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddHouseWizard
