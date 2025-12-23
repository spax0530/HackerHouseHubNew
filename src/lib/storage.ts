import { supabase } from './supabase'

export const uploadHouseImage = async (file: File, houseId?: number): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    // If houseId is provided, organize in folder, else root or temp
    const filePath = houseId ? `house-${houseId}/${fileName}` : `temp/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('house-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage.from('house-images').getPublicUrl(filePath)
    return data.publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
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

