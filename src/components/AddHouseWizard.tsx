import { useState, useRef, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, CheckCircle, Link as LinkIcon, Upload, ArrowUp, ArrowDown, Plus, Sparkles, Eye } from 'lucide-react'
import { toast } from 'sonner'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import type { HouseTheme } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase, type House } from '../lib/supabase'
import { uploadHouseImage } from '../lib/storage'
import { generateSlug } from '../lib/utils'
import { CityStateAutocomplete } from './CityStateAutocomplete'
import { enhanceText } from '../lib/openai'
import HousePreviewModal from './HousePreviewModal'

interface AddHouseWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onHouseAdded: (house: any) => void
  editingHouse?: House | null // Optional house to edit
}

export interface HouseFormData {
  // Step 1
  name: string
  city: string
  state: string
  theme: HouseTheme | '' | 'Custom'
  customTheme: string
  capacity: number
  // Step 2
  pricePerMonth: number
  duration: string
  durationType: 'fixed' | 'flexible'
  durationValue: number
  durationUnit: 'days' | 'months'
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
const restoreFormData = (): { formData: Partial<HouseFormData>; step: number; imagePreviews: string[]; existingImages: string[] } => {
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
          customTheme: parsed.customTheme || '',
          capacity: parsed.capacity || 0,
          pricePerMonth: parsed.pricePerMonth || 0,
          duration: parsed.duration || '',
          durationType: parsed.durationType || 'fixed',
          durationValue: parsed.durationValue || 0,
          durationUnit: parsed.durationUnit || 'months',
          status: parsed.status || 'Recruiting Now',
          description: parsed.description || '',
          highlights: parsed.highlights || '',
          amenities: parsed.amenities || [],
          applicationLink: parsed.applicationLink || '',
        },
        step: parsed.currentStep || 1,
        imagePreviews: parsed.imagePreviewUrls || [],
        existingImages: parsed.existingImageUrls || [],
      }
    }
  } catch (error) {
    console.error('Error restoring form data from localStorage:', error)
  }
  return {
    formData: {},
    step: 1,
    imagePreviews: [],
    existingImages: [],
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
    theme: (restored.formData.theme as HouseTheme | 'Custom') || '',
    customTheme: restored.formData.customTheme || '',
    capacity: restored.formData.capacity || 0,
    pricePerMonth: restored.formData.pricePerMonth || 0,
    duration: restored.formData.duration || '',
    durationType: restored.formData.durationType || 'fixed',
    durationValue: restored.formData.durationValue || 0,
    durationUnit: restored.formData.durationUnit || 'months',
    status: (restored.formData.status as 'Recruiting Now' | 'Full' | 'Closed') || 'Recruiting Now',
    description: restored.formData.description || '',
    highlights: restored.formData.highlights || '',
    amenities: restored.formData.amenities || [],
    applicationLink: restored.formData.applicationLink || '',
    imageFiles: [],
    imagePreviews: [],
    existingImages: [],
  })

  const [showPreview, setShowPreview] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [enhancingDescription, setEnhancingDescription] = useState(false)
  const [enhancingAmenities, setEnhancingAmenities] = useState(false)

  // Load house data when editing
  useEffect(() => {
    if (open && editingHouse) {
      // Populate form with existing house data
      const existingImages = editingHouse.images || []
      const themeOptions: (HouseTheme | 'Custom')[] = ['AI', 'Climate', 'Hardware', 'Crypto', 'General Startup']
      const isCustomTheme = !themeOptions.includes(editingHouse.theme as HouseTheme)
      
      // Parse duration
      const durationStr = editingHouse.duration || ''
      let durationType: 'fixed' | 'flexible' = 'fixed'
      let durationValue = 0
      let durationUnit: 'days' | 'months' = 'months'
      
      if (durationStr.toLowerCase().includes('depending')) {
        durationType = 'flexible'
      } else {
        const match = durationStr.match(/(\d+)\s*(day|month)/i)
        if (match) {
          durationValue = parseInt(match[1])
          durationUnit = match[2].toLowerCase().startsWith('day') ? 'days' : 'months'
        }
      }
      
      setFormData({
        name: editingHouse.name || '',
        city: editingHouse.city || '',
        state: editingHouse.state || '',
        theme: isCustomTheme ? 'Custom' : (editingHouse.theme as HouseTheme),
        customTheme: isCustomTheme ? editingHouse.theme : '',
        capacity: editingHouse.capacity || 0,
        pricePerMonth: editingHouse.price_per_month || 0,
        duration: editingHouse.duration || '',
        durationType,
        durationValue,
        durationUnit,
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
      if (saved.formData.name || saved.formData.city || saved.imagePreviews.length > 0) {
        // Restore if there's any saved data (name, city, or images)
        setFormData(prev => ({
          ...prev,
          ...saved.formData,
          imageFiles: [], // Files can't be restored, user will need to re-upload
          imagePreviews: saved.imagePreviews, // Restore image URLs
          existingImages: saved.existingImages, // Restore existing image tracking
        }))
        setCurrentStep(saved.step)
      } else {
        // Reset to empty form only if no saved data exists
        setFormData({
          name: '',
          city: '',
          state: '',
          theme: '',
          customTheme: '',
          capacity: 0,
          pricePerMonth: 0,
          duration: '',
          durationType: 'fixed',
          durationValue: 0,
          durationUnit: 'months',
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
  // Use a debounced save to avoid excessive writes
  useEffect(() => {
    if (open && !editingHouse) {
      const timeoutId = setTimeout(() => {
        try {
          // Only save serializable data (exclude File objects and blob URLs)
          const dataToSave = {
            name: formData.name,
            city: formData.city,
            state: formData.state,
            theme: formData.theme,
            customTheme: formData.customTheme,
            capacity: formData.capacity,
            pricePerMonth: formData.pricePerMonth,
            duration: formData.duration,
            durationType: formData.durationType,
            durationValue: formData.durationValue,
            durationUnit: formData.durationUnit,
            status: formData.status,
            description: formData.description,
            highlights: formData.highlights,
            amenities: formData.amenities,
            applicationLink: formData.applicationLink,
            currentStep: currentStep,
            // Save image preview URLs (but not File objects)
            imagePreviewUrls: formData.imagePreviews.filter(url => url.startsWith('http')),
            existingImageUrls: formData.existingImages,
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
        } catch (error) {
          console.error('Error saving form data to localStorage:', error)
        }
      }, 300) // Debounce by 300ms

      return () => clearTimeout(timeoutId)
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
        const themeValid = formData.theme !== '' && (formData.theme !== 'Custom' || formData.customTheme.trim() !== '')
        return (
          formData.name.trim() !== '' &&
          formData.city.trim() !== '' &&
          formData.state.trim() !== '' &&
          themeValid &&
          formData.capacity > 0
        )
      case 2:
        const durationValid = formData.durationType === 'flexible' || 
          (formData.durationType === 'fixed' && formData.durationValue > 0)
        return formData.pricePerMonth >= 0 && durationValid
      case 3:
        return formData.description.trim() !== ''
      case 4:
        return formData.imagePreviews.length > 0 // Allow existing images when editing
      default:
        return true
    }
  }

  // Update duration string when duration fields change
  useEffect(() => {
    if (formData.durationType === 'flexible') {
      if (formData.duration !== 'Depending on applicant') {
        setFormData(prev => ({ ...prev, duration: 'Depending on applicant' }))
      }
    } else if (formData.durationType === 'fixed' && formData.durationValue > 0) {
      const unit = formData.durationUnit === 'days' ? 'day' : 'month'
      const plural = formData.durationValue > 1 ? 's' : ''
      const newDuration = `${formData.durationValue} ${unit}${plural}`
      if (formData.duration !== newDuration) {
        setFormData(prev => ({ ...prev, duration: newDuration }))
      }
    }
  }, [formData.durationType, formData.durationValue, formData.durationUnit])

  // Get final theme value (custom or selected)
  const getFinalTheme = (): string => {
    return formData.theme === 'Custom' ? formData.customTheme : formData.theme
  }

  // AI enhancement handlers
  const handleEnhanceDescription = async () => {
    if (!formData.description.trim()) {
      toast.error('Please enter a description first')
      return
    }

    setEnhancingDescription(true)
    try {
      const enhanced = await enhanceText({ text: formData.description, context: 'description' })
      updateField('description', enhanced)
      toast.success('Description enhanced!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to enhance description')
    } finally {
      setEnhancingDescription(false)
    }
  }

  const handleEnhanceAmenities = async () => {
    const amenitiesText = formData.amenities.join(', ')
    if (!amenitiesText.trim()) {
      toast.error('Please add some amenities first')
      return
    }

    setEnhancingAmenities(true)
    try {
      const enhanced = await enhanceText({ text: amenitiesText, context: 'amenities' })
      // Parse enhanced text back into array (split by commas, newlines, or bullets)
      const enhancedList = enhanced
        .split(/[,\n•\-\*]/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
      
      // Merge with existing amenities, avoiding duplicates
      const merged = [...formData.amenities]
      enhancedList.forEach(item => {
        if (!merged.includes(item)) {
          merged.push(item)
        }
      })
      
      updateField('amenities', merged)
      toast.success('Amenities enhanced!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to enhance amenities')
    } finally {
      setEnhancingAmenities(false)
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

  const handlePublishClick = () => {
    if (!validateStep(4)) {
      toast.error('Please complete all required fields')
      return
    }
    setShowConfirmModal(true)
  }

  const handlePublish = async () => {
    if (!user) {
      toast.error('You must be logged in to publish a house')
      return
    }

    setShowConfirmModal(false)
    setIsSubmitting(true)

    try {
      // Check if we have any images at all before proceeding
      if (formData.imagePreviews.length === 0) {
        throw new Error('At least one image is required')
      }

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
      const finalImageUrls: string[] = []
      
      // Track which new image URLs we've used
      let newImageUrlIndex = 0
      
      for (let i = 0; i < formData.imagePreviews.length; i++) {
        const preview = formData.imagePreviews[i]
        
        // If it's an existing image (already an HTTP URL), keep it
        if (formData.existingImages.includes(preview)) {
          finalImageUrls.push(preview)
        } 
        // Otherwise, it's a new upload (blob URL) - use the corresponding uploaded URL
        else if (preview.startsWith('blob:')) {
          if (newImageUrlIndex < newImageUrls.length) {
            finalImageUrls.push(newImageUrls[newImageUrlIndex])
            newImageUrlIndex++
          } else {
            // Upload failed for this file - show error
            console.error(`Upload failed for image at index ${i}`)
          }
        }
        // If it's already an HTTP URL but not in existingImages, keep it (might be from a previous edit)
        else if (preview.startsWith('http')) {
          finalImageUrls.push(preview)
        }
      }

      // Final validation - must have at least one valid image URL
      if (finalImageUrls.length === 0) {
        console.error('Image mapping debug:', {
          imagePreviews: formData.imagePreviews,
          existingImages: formData.existingImages,
          imageFiles: formData.imageFiles.length,
          newImageUrls: newImageUrls.length,
          uploadErrors: uploadErrors,
        })
        
        // If we have upload errors, show them
        if (uploadErrors.length > 0) {
          throw new Error(`Failed to upload images: ${uploadErrors.join('; ')}. Please try uploading again.`)
        }
        
        // If we have images but they're all blob URLs and no uploads succeeded
        if (formData.imagePreviews.length > 0 && newImageUrls.length === 0 && formData.imageFiles.length > 0) {
          throw new Error('Image upload failed. Please try uploading your images again.')
        }
        
        throw new Error('At least one image is required. Please add at least one image before publishing.')
      }

      if (uploadErrors.length > 0 && finalImageUrls.length > 0) {
        toast.warning(`Some images failed to upload: ${uploadErrors.join(', ')}`)
      }

      const houseData: any = {
        name: formData.name,
        city: formData.city,
        state: formData.state,
        theme: getFinalTheme(),
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
        // Update existing house - preserve admin_status (don't reset it)
        // Only update admin_status if it's explicitly being changed (not in this flow)
        // Don't include slug when editing - it may not exist in the database yet,
        // and if it does, the trigger will handle regeneration if needed
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
        // Create new house - include slug for new houses only
        const slug = generateSlug(`${formData.name}-${formData.city}-${formData.state}`)
        const { data: insertData, error: insertError } = await supabase
          .from('houses')
          .insert({
            ...houseData,
            host_id: user.id,
            admin_status: 'pending', // New houses require admin review
            slug: slug, // Only include slug for new houses
          })
          .select()
          .single()

        data = insertData
        error = insertError

        if (error) throw error

        // Show message based on actual admin_status
        const adminStatus = data?.admin_status || 'pending'
        if (adminStatus === 'pending') {
          toast.success('House submitted for review', {
            description: `We'll notify you once ${formData.name} is approved.`,
          })
        } else {
          toast.success('House published successfully', {
            description: `${formData.name} is now live on the platform!`,
          })
        }
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
        customTheme: '',
        capacity: 0,
        pricePerMonth: 0,
        duration: '',
        durationType: 'fixed',
        durationValue: 0,
        durationUnit: 'months',
        status: 'Recruiting Now',
        description: '',
        highlights: '',
        amenities: [],
        applicationLink: '',
        imageFiles: [],
        imagePreviews: [],
        existingImages: [],
      })
      setShowPreview(false)
      setShowConfirmModal(false)
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City & State <span className="text-red-500">*</span>
                </label>
                <CityStateAutocomplete
                  value={{ city: formData.city, state: formData.state }}
                  onChange={(location) => {
                    setFormData((prev) => ({
                      ...prev,
                      city: location.city,
                      state: location.state,
                    }))
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => updateField('theme', e.target.value as HouseTheme | 'Custom')}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select theme</option>
                  <option value="AI">AI</option>
                  <option value="Climate">Climate</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Crypto">Crypto</option>
                  <option value="General Startup">General Startup</option>
                  <option value="Custom">Custom</option>
                </select>
                {formData.theme === 'Custom' && (
                  <input
                    type="text"
                    value={formData.customTheme}
                    onChange={(e) => updateField('customTheme', e.target.value)}
                    placeholder="Enter custom theme"
                    className="w-full mt-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
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
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="durationType"
                        value="fixed"
                        checked={formData.durationType === 'fixed'}
                        onChange={() => updateField('durationType', 'fixed')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Fixed Duration</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="durationType"
                        value="flexible"
                        checked={formData.durationType === 'flexible'}
                        onChange={() => updateField('durationType', 'flexible')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Depending on Applicant</span>
                    </label>
                  </div>
                  {formData.durationType === 'fixed' && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={formData.durationValue || ''}
                        onChange={(e) => updateField('durationValue', parseInt(e.target.value) || 0)}
                        placeholder="Number"
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={formData.durationUnit}
                        onChange={(e) => updateField('durationUnit', e.target.value as 'days' | 'months')}
                        className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="days">Days</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  )}
                </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleEnhanceDescription}
                    disabled={enhancingDescription || !formData.description.trim()}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Sparkles size={14} />
                    {enhancingDescription ? 'Enhancing...' : 'Enhance with AI'}
                  </button>
                </div>
                <div className="rich-text-editor">
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={(value) => updateField('description', value)}
                    placeholder="Describe your hacker house..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ],
                    }}
                    className="bg-white dark:bg-slate-900"
                  />
                </div>
                <style>{`
                  .rich-text-editor .ql-container {
                    min-height: 150px;
                    font-size: 14px;
                  }
                  .rich-text-editor .ql-editor {
                    color: rgb(17 24 39);
                  }
                  .dark .rich-text-editor .ql-editor {
                    color: rgb(241 245 249);
                  }
                  .rich-text-editor .ql-toolbar {
                    border-color: rgb(209 213 219);
                    border-radius: 0.5rem 0.5rem 0 0;
                  }
                  .dark .rich-text-editor .ql-toolbar {
                    border-color: rgb(51 65 85);
                    background: rgb(15 23 42);
                  }
                  .rich-text-editor .ql-container {
                    border-color: rgb(209 213 219);
                    border-radius: 0 0 0.5rem 0.5rem;
                  }
                  .dark .rich-text-editor .ql-container {
                    border-color: rgb(51 65 85);
                  }
                  .rich-text-editor .ql-stroke {
                    stroke: rgb(107 114 128);
                  }
                  .dark .rich-text-editor .ql-stroke {
                    stroke: rgb(148 163 184);
                  }
                  .rich-text-editor .ql-fill {
                    fill: rgb(107 114 128);
                  }
                  .dark .rich-text-editor .ql-fill {
                    fill: rgb(148 163 184);
                  }
                `}</style>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amenities
                  </label>
                  <button
                    type="button"
                    onClick={handleEnhanceAmenities}
                    disabled={enhancingAmenities || formData.amenities.length === 0}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Sparkles size={14} />
                    {enhancingAmenities ? 'Enhancing...' : 'Enhance with AI'}
                  </button>
                </div>
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
                    <span className="font-medium">Theme:</span> {getFinalTheme()}
                  </p>
                  <p>
                    <span className="font-medium">Price:</span> ${formData.pricePerMonth === 0 ? 'Free' : `${formData.pricePerMonth}/mo`}
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(true)}
                disabled={!validateStep(4)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Eye size={18} />
                Preview
              </button>
              <button
                onClick={handlePublishClick}
                disabled={isSubmitting || !validateStep(4)}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting 
                  ? (editingHouse ? 'Updating...' : 'Publishing...') 
                  : (editingHouse ? 'Update House' : 'Publish House')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <HousePreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          formData={{
            ...formData,
            theme: getFinalTheme(),
          } as HouseFormData & { theme: string }}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md mx-4 z-50 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Publication
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your house listing will be reviewed by our team before going live. If any edits are needed, you will be contacted. For questions, contact{' '}
              <a href="mailto:Help@HackerHouseHub.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                Help@HackerHouseHub.com
              </a>
              .
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirm Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddHouseWizard
