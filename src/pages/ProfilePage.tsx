import { useState, useEffect, useRef } from 'react'
import { User, Globe, Linkedin, Github, Camera, Loader2, Building2, User as UserIcon, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { uploadProfileAvatar } from '../lib/storage'
import { useNavigate } from 'react-router-dom'

function ProfilePage() {
  const { user, profile: initialProfile, switchRole } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [switchingRole, setSwitchingRole] = useState<'applicant' | 'host' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
    website_url: '',
    avatar_url: '',
  })

  useEffect(() => {
    if (initialProfile) {
      setFormData({
        full_name: initialProfile.full_name || '',
        bio: initialProfile.bio || '',
        linkedin_url: initialProfile.linkedin_url || '',
        github_url: initialProfile.github_url || '',
        website_url: initialProfile.website_url || '',
        avatar_url: initialProfile.avatar_url || '',
      })
    }
  }, [initialProfile])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return

    try {
      setUploading(true)
      const file = e.target.files[0]
      const publicUrl = await uploadProfileAvatar(file, user.id)

      if (publicUrl) {
        setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
        
        // Auto-save avatar update
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id)

        if (error) throw error
        toast.success('Avatar updated')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleRoleSwitch = async (newRole: 'applicant' | 'host') => {
    if (!user || switchingRole) return
    if (initialProfile?.role === newRole) {
      toast.info(`You're already in ${newRole === 'host' ? 'Host' : 'Builder'} mode`)
      return
    }

    setSwitchingRole(newRole) // Track which role we're switching to
    try {
      const { error } = await switchRole(newRole)
      if (error) {
        toast.error(error.message || 'Failed to switch role')
        setSwitchingRole(null)
        return
      }

      // Redirect based on new role
      if (newRole === 'host') {
        navigate('/host/dashboard')
      } else {
        navigate('/applications')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to switch role')
      setSwitchingRole(null)
    } finally {
      // Don't reset here - let the redirect happen, or reset after a delay
      setTimeout(() => setSwitchingRole(null), 1000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          linkedin_url: formData.linkedin_url,
          github_url: formData.github_url,
          website_url: formData.website_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile Settings</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Manage your public profile information
            </p>
          </div>

          {/* Role Switcher */}
          <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Account Role</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Switch between Builder and Host modes. You can use both features with the same account.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRoleSwitch('applicant')}
                disabled={switchingRole !== null || initialProfile?.role === 'applicant'}
                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  initialProfile?.role === 'applicant'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${switchingRole !== null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <UserIcon size={24} />
                <div className="text-center">
                  <div className="font-medium">Builder</div>
                  <div className="text-xs mt-1 opacity-75">
                    {initialProfile?.role === 'applicant' ? 'Current Mode' : 'Switch to Builder'}
                  </div>
                </div>
                {switchingRole === 'applicant' && (
                  <RefreshCw size={16} className="animate-spin" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('host')}
                disabled={switchingRole !== null || initialProfile?.role === 'host'}
                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  initialProfile?.role === 'host'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                } ${switchingRole !== null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Building2 size={24} />
                <div className="text-center">
                  <div className="font-medium">Host</div>
                  <div className="text-xs mt-1 opacity-75">
                    {initialProfile?.role === 'host' ? 'Current Mode' : 'Switch to Host'}
                  </div>
                </div>
                {switchingRole === 'host' && (
                  <RefreshCw size={16} className="animate-spin" />
                )}
              </button>
            </div>
            {initialProfile?.role && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Currently viewing as: <span className="font-medium capitalize">{initialProfile.role === 'applicant' ? 'Builder' : 'Host'}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700">
                  {formData.avatar_url ? (
                    <img 
                      src={formData.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User size={40} />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-white cursor-pointer"
                  disabled={uploading}
                >
                  {uploading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Profile Picture</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Upload a photo to help hosts and builders recognize you.
                </p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Tell us about yourself, what you're building, or what you're looking for..."
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-800 pt-6">
                Social Links
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LinkedIn URL
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GitHub URL
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url"
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website / Portfolio
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-800">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

