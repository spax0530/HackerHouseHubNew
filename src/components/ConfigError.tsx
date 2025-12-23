import { AlertCircle } from 'lucide-react'

function ConfigError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-900">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Configuration Error
          </h1>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Supabase environment variables are not configured. Please set the following in your Vercel project settings:
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 font-mono text-sm">
          <div className="mb-2">
            <span className="text-gray-500">VITE_SUPABASE_URL</span>
            <br />
            <span className="text-gray-700 dark:text-gray-300">Your Supabase project URL</span>
          </div>
          <div>
            <span className="text-gray-500">VITE_SUPABASE_ANON_KEY</span>
            <br />
            <span className="text-gray-700 dark:text-gray-300">Your Supabase anon/public key</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">To fix this:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Go to your Vercel project dashboard</li>
            <li>Navigate to Settings → Environment Variables</li>
            <li>Add both variables for Production, Preview, and Development</li>
            <li>Redeploy your application</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default ConfigError

