import { supabase } from './supabase'

export interface SubmitApplicationParams {
  houseId: number
  applicantId: string
  applicantName: string
  email: string
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
}

export const submitApplication = async (params: SubmitApplicationParams) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .insert({
        house_id: params.houseId,
        applicant_id: params.applicantId,
        applicant_name: params.applicantName,
        email: params.email,
        phone: params.phone || null,
        linkedin: params.linkedin || null,
        portfolio: params.portfolio || null,
        current_role: params.currentRole || null,
        company: params.company || null,
        skills: params.skills || null,
        years_experience: params.yearsExperience || null,
        building_what: params.buildingWhat || null,
        why_this_house: params.whyThisHouse || null,
        duration_preference: params.durationPreference || null,
        move_in_date: params.moveInDate || null,
        custom_answers: params.customAnswers || null,
        status: 'Pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error submitting application:', error)
      throw error
    }

    console.log('Application submitted successfully:', data)
    return { success: true, data }
  } catch (error: any) {
    console.error('Error submitting application:', error)
    return { success: false, error }
  }
}

