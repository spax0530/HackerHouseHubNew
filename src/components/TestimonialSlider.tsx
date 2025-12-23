import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react'

export interface Testimonial {
  id: number
  quote: string
  author: string
  role: string
  avatar: string
  house: string
}

interface TestimonialSliderProps {
  testimonials: Testimonial[]
}

function TestimonialSlider({ testimonials }: TestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused || testimonials.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused, testimonials.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (testimonials.length === 0) return null

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Testimonial Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-8 md:p-10 lg:p-12 border border-gray-100 dark:border-gray-800">
        <Quote className="text-blue-500 dark:text-blue-400 mb-4 md:mb-6" size={28} />
        
        <blockquote className="text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-6 md:mb-8 leading-relaxed">
          "{currentTestimonial.quote}"
        </blockquote>

        <div className="flex items-center gap-3 md:gap-4">
          <img
            src={currentTestimonial.avatar}
            alt={currentTestimonial.author}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold text-sm md:text-base text-gray-900 dark:text-gray-100">
              {currentTestimonial.author}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              {currentTestimonial.role} at{' '}
              <span className="text-blue-600 dark:text-blue-400">{currentTestimonial.house}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Previous testimonial"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Next testimonial"
          >
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-blue-600 dark:bg-blue-500'
                  : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestimonialSlider
