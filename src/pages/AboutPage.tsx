import { Building2, Users, Home, Sparkles, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

function AboutPage() {
  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            About HackerHouseHub
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connecting ambitious builders with collaborative living spaces designed for innovation
            and growth.
          </p>
        </div>

        {/* What is HackerHouseHub */}
        <section className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="text-blue-600 dark:text-blue-400" size={32} />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              What is HackerHouseHub?
            </h2>
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              HackerHouseHub is a platform that brings together builders, founders, engineers,
              and creators who are passionate about building the future. We connect ambitious
              individuals with vetted hacker houses—collaborative living spaces designed to foster
              innovation, community, and growth.
            </p>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Whether you're working on an AI startup, building climate tech solutions, developing
              hardware, or launching a crypto project, HackerHouseHub helps you find the perfect
              living environment where you can focus on what matters most: building.
            </p>
          </div>
        </section>

        {/* For Builders */}
        <section className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-green-600 dark:text-green-400" size={32} />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              For Builders
            </h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 md:p-8">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Find Your Perfect Match
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Browse vetted hacker houses across the U.S. Filter by location, theme, price,
                    and amenities to find the space that fits your project and lifestyle.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Streamlined Applications
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Apply to multiple houses with a simple, standardized process. Track your
                    applications and get notified when hosts respond.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Build Together
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Join a community of like-minded builders. Share resources, collaborate on
                    projects, and learn from peers who are also building the future.
                  </p>
                </div>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                to="/search"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Browse Houses
              </Link>
            </div>
          </div>
        </section>

        {/* For Hosts */}
        <section className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Home className="text-purple-600 dark:text-purple-400" size={32} />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              For Hosts
            </h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 md:p-8">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    List Your House
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Showcase your hacker house to thousands of builders. Add photos, amenities,
                    and custom application questions to attract the right residents.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Review Applications
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Manage applications from your dashboard. Review builder profiles, add private
                    notes, and make decisions that build the best community for your house.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Grow Your Community
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Connect with ambitious builders and help them succeed. Build a reputation as a
                    top destination for innovators and creators.
                  </p>
                </div>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                to="/host/dashboard"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                List Your House
              </Link>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-8 md:p-10 text-center">
          <Sparkles className="text-blue-600 dark:text-blue-400 mx-auto mb-4" size={40} />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Our Mission
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            We believe that the best work happens when builders come together. HackerHouseHub
            exists to make it easier for ambitious creators to find their tribe, build their
            projects, and shape the future—one house at a time.
          </p>
        </section>
      </div>
    </div>
  )
}

export default AboutPage

