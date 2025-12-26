import { Building2, Users, TrendingUp, MapPin } from 'lucide-react'

function TrustedBy() {
  // Industry-wide statistics for the hacker house movement
  const displayMetrics = [
    {
      value: '500+',
      label: 'Hacker Houses Worldwide',
      icon: Building2,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      value: '10K+',
      label: 'Builders & Entrepreneurs',
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      value: '$2B+',
      label: 'Companies Founded',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      value: '50+',
      label: 'Cities Globally',
      icon: MapPin,
      color: 'text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Join a Growing Movement
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The hacker house community is thriving worldwide
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
          {displayMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-800 text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 ${metric.color}`}>
                  <Icon size={24} />
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {metric.value}
                </div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                  {metric.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TrustedBy
