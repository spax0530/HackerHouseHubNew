import { useAppContext } from '../context/AppContext'
import HouseCard from '../components/HouseCard'
import EmptyState from '../components/EmptyState'

function FavoritesPage() {
  const { favorites } = useAppContext()

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <EmptyState
          title="No saved houses yet"
          description="Start exploring and save your favorite hacker houses to view them here."
          actionLabel="Explore Houses"
          onAction={() => (window.location.href = '/search')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Saved Hacker Houses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {favorites.length} {favorites.length === 1 ? 'house' : 'houses'} saved
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((house) => (
            <HouseCard
              key={house.id}
              id={house.id}
              name={house.name}
              city={house.city}
              theme={house.theme}
              price={house.price}
              duration="3–6 months"
              image={house.image}
              showComparison
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default FavoritesPage
