import { supabase } from './supabase'

export const uploadHouseImage = async (file: File, _houseId?: number, userId?: string): Promise<string | null> => {
  try {
    // Validate file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      throw new Error(`File ${file.name} is too large. Maximum size is 20MB.`)
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !['jpg', 'jpeg', 'png', 'webp'].includes(fileExt)) {
      throw new Error(`File ${file.name} has an invalid format. Only JPG, PNG, and WebP are allowed.`)
    }

    const fileName = `${crypto.randomUUID()}.${fileExt}`
    // Use userId folder for organization, or temp if no userId
    const filePath = userId ? `${userId}/${fileName}` : `temp/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('house-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error details:', uploadError)
      throw new Error(uploadError.message || 'Failed to upload image')
    }

    const { data } = supabase.storage.from('house-images').getPublicUrl(filePath)
    if (!data?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image')
    }
    
    return data.publicUrl
  } catch (error: any) {
    console.error('Error uploading image:', error)
    throw error // Re-throw to get better error messages
  }
}

export const uploadProfileAvatar = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars') // Assume avatars bucket or use house-images if simple
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    return data.publicUrl
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return null
  }
}

