function TrustedBy() {
  // Placeholder logos - just gray boxes for now
  const logos = Array.from({ length: 6 }, (_, i) => i + 1)

  const metrics = [
    { value: '500+', label: 'Active Builders' },
    { value: '50+', label: 'Hacker Houses' },
    { value: '$100M+', label: 'Raised by Alumni' },
  ]

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-12">
            Trusted by the builder community
          </h2>

          {/* Logo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-16 max-w-5xl mx-auto">
            {logos.map((logo) => (
              <div
                key={logo}
                className="h-12 md:h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700"
              >
                <span className="text-gray-400 dark:text-gray-600 text-xs md:text-sm">Logo {logo}</span>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-3xl mx-auto">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {metric.value}
                </div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrustedBy
