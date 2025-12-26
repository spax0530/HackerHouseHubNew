import { Link } from 'react-router-dom'

function CtaSection() {
  return (
    <section className="py-20 md:py-28 lg:py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-sky-950/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
          Run a Hacker House?
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          List your property and connect with incredible builders. Join our network of hosts building the future.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-6">
          <Link
            to="/host/dashboard"
            className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm md:text-base"
          >
            List My House
          </Link>
          <Link
            to="/how-it-works"
            className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 rounded-lg border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900 transition-colors text-sm md:text-base"
          >
            Learn More
          </Link>
        </div>

        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          Free forever • No credit card required
        </p>
      </div>
    </section>
  )
}

export default CtaSection
