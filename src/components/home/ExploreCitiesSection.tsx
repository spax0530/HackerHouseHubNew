import CityCard from '../CityCard'

const cities = [
  {
    name: 'San Francisco',
    count: 12,
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=600&fit=crop',
  },
  {
    name: 'Los Angeles',
    count: 8,
    image: 'https://images.unsplash.com/photo-1515895306151-8a2f547240c4?w=600&h=600&fit=crop',
  },
  {
    name: 'Austin',
    count: 6,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
  },
  {
    name: 'New York',
    count: 9,
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=600&fit=crop',
  },
  {
    name: 'Miami',
    count: 5,
    image: 'https://images.unsplash.com/photo-1513884923967-4d182d5e9baf?w=600&h=600&fit=crop',
  },
  {
    name: 'Seattle',
    count: 7,
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=600&fit=crop',
  },
]

function ExploreCitiesSection() {
  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
            Explore by City
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Discover hacker houses in top tech cities across the U.S.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {cities.map((city) => (
            <CityCard key={city.name} {...city} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ExploreCitiesSection
