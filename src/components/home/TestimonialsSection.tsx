import TestimonialSlider, { type Testimonial } from '../TestimonialSlider'

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: 'Living at the AI Innovation House transformed my startup journey. The community here is incredible, and I\'ve met co-founders, investors, and lifelong friends.',
    author: 'Sarah Chen',
    role: 'Founder & CEO',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    house: 'AI Innovation House',
  },
  {
    id: 2,
    quote: 'The Climate Tech Hub gave me the space and community I needed to build. The collaborative environment here is unmatched, and the support from fellow builders is incredible.',
    author: 'Marcus Rodriguez',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    house: 'Climate Tech Hub',
  },
  {
    id: 3,
    quote: 'I\'ve raised $2M since joining Crypto Builders. The network and resources here are game-changing. This is where real innovation happens.',
    author: 'Alex Kim',
    role: 'Founder',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    house: 'Crypto Builders',
  },
]

function TestimonialsSection() {
  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
            What builders are saying
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Hear from residents who've found their home at HackerHouseHub
          </p>
        </div>

        <TestimonialSlider testimonials={testimonials} />
      </div>
    </section>
  )
}

export default TestimonialsSection
