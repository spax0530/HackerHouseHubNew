import { Linkedin, Twitter } from 'lucide-react'

interface Resident {
  id: number
  name: string
  role: string
  bio: string
  avatar: string
  linkedin?: string
  twitter?: string
}

interface ResidentsSectionProps {
  residents: Resident[]
}

function ResidentsSection({ residents }: ResidentsSectionProps) {
  if (residents.length === 0) return null

  return (
    <section className="py-8 md:py-10">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Current Residents
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {residents.map((resident) => (
          <div
            key={resident.id}
            className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow"
          >
            <img
              src={resident.avatar}
              alt={resident.name}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {resident.name}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{resident.role}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {resident.bio}
              </p>
              {(resident.linkedin || resident.twitter) && (
                <div className="flex items-center gap-3">
                  {resident.linkedin && (
                    <a
                      href={resident.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      aria-label={`${resident.name}'s LinkedIn`}
                    >
                      <Linkedin size={18} />
                    </a>
                  )}
                  {resident.twitter && (
                    <a
                      href={resident.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-400 transition-colors"
                      aria-label={`${resident.name}'s Twitter`}
                    >
                      <Twitter size={18} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ResidentsSection

