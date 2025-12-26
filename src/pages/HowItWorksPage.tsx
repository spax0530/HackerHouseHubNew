import { Link } from 'react-router-dom'
import { Search, Building2, Users, CheckCircle, ArrowRight, Mail } from 'lucide-react'

function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      title: 'Browse & Search',
      description: 'Explore hacker houses across top tech cities. Filter by location, theme, price, and duration to find your perfect match.',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop',
      icon: Search,
    },
    {
      number: '02',
      title: 'Apply to Houses',
      description: 'Submit your application with your background, skills, and what you\'re building. Hosts review applications and connect with builders.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      icon: Mail,
    },
    {
      number: '03',
      title: 'Get Accepted',
      description: 'Once accepted, coordinate with your host on move-in details. Join a community of builders working on exciting projects.',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop',
      icon: CheckCircle,
    },
    {
      number: '04',
      title: 'Build Together',
      description: 'Live with like-minded builders, share ideas, collaborate on projects, and grow your network in the tech community.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
      icon: Users,
    },
  ]

  const hostSteps = [
    {
      title: 'List Your House',
      description: 'Create a detailed listing with photos, amenities, and house rules. Set your pricing and availability.',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
    },
    {
      title: 'Review Applications',
      description: 'Browse builder applications, review their backgrounds and projects. Accept builders who align with your house culture.',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
    },
    {
      title: 'Build Community',
      description: 'Foster a collaborative environment where builders can thrive. Watch your house become a hub of innovation.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-sky-950/20 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
              <Building2 className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              How HackerHouseHub Works
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8">
              Connect builders with hacker houses. Build communities. Create the future.
            </p>
          </div>
        </div>
      </section>

      {/* For Builders Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              For Builders
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Find your next hacker house in four simple steps
            </p>
          </div>

          <div className="space-y-24 md:space-y-32">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 1

              return (
                <div
                  key={step.number}
                  className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 md:gap-12`}
                >
                  {/* Image */}
                  <div className="flex-1 w-full">
                    <div className="relative rounded-2xl overflow-hidden shadow-xl">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-64 md:h-96 object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-white dark:bg-slate-900 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                        <Icon className="text-blue-600 dark:text-blue-400" size={24} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-6xl font-bold text-gray-200 dark:text-gray-800">
                        {step.number}
                      </span>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* For Hosts Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              For Hosts
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              List your house and connect with incredible builders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {hostSteps.map((step, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="relative h-48">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white dark:bg-slate-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of builders and hosts building the future together
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/search"
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                Browse Houses
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/host/dashboard?add=true"
                className="w-full sm:w-auto px-8 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                List Your House
                <Building2 size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HowItWorksPage

