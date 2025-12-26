import { Link } from 'react-router-dom'

interface CityCardProps {
  city: string
  count: number
  image: string
}

function CityCard({ city, count, image }: CityCardProps) {
  return (
    <Link
      to={`/search?city=${city}`}
      className="group relative block aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="absolute inset-0">
        <img
          src={image}
          alt={city}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
        <h3 className="text-xl md:text-2xl font-semibold mb-1">{city}</h3>
        <p className="text-xs md:text-sm text-gray-200">
          {count === 0 ? 'Coming soon' : count === 1 ? '1 house' : `${count} houses`}
        </p>
      </div>
    </Link>
  )
}

export default CityCard
