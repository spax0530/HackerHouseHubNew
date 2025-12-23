import { Shield, Zap, Sparkles } from 'lucide-react'

interface Feature {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  description: string
  iconBg: string
}

const features: Feature[] = [
  {
    icon: Shield,
    title: 'Vetted Houses',
    description: 'Every property is carefully reviewed to ensure quality, safety, and a true builder-focused environment.',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: Zap,
    title: 'Fast Applications',
    description: 'Streamlined application process gets you matched with the right house quickly and efficiently.',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  {
    icon: Sparkles,
    title: 'Builder-First Community',
    description: 'Connect with ambitious founders, engineers, and creators who share your passion for building.',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
  },
]

function FeaturesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 dark:border-gray-800"
              >
                <div className={`w-12 h-12 rounded-full ${feature.iconBg} flex items-center justify-center mb-4`}>
                  <Icon size={24} className="text-gray-900 dark:text-gray-100" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
