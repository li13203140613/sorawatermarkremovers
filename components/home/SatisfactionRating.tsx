'use client'

import { useState } from 'react'

const STAR_COUNT = 5

interface SatisfactionRatingProps {
  title: string
  subtitle: string
  prompt: string
  receivedMessage: string
}

export default function SatisfactionRating({
  title,
  subtitle,
  prompt,
  receivedMessage,
}: SatisfactionRatingProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const displayValue = hovered || rating

  const handleRate = (value: number) => {
    setRating(value)
    setSubmitted(true)
  }

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
      <div className="flex items-center justify-center gap-2 mb-3">
        {Array.from({ length: STAR_COUNT }).map((_, index) => {
          const value = index + 1
          const filled = value <= displayValue
          return (
            <button
              key={value}
              type="button"
              className={`h-10 w-10 rounded-xl transition ${
                filled
                  ? 'bg-yellow-100 text-yellow-500 shadow-sm'
                  : 'bg-gray-100 text-gray-400 hover:bg-yellow-50'
              }`}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => handleRate(value)}
              aria-pressed={filled}
              aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.945a1 1 0 00.95.69h4.155c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.287 3.944c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.366 2.447c-.784.57-1.84-.197-1.54-1.118l1.286-3.944a1 1 0 00-.364-1.118L2.65 9.372c-.783-.57-.38-1.81.588-1.81h4.154a1 1 0 00.951-.69l1.286-3.945z" />
              </svg>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-gray-500">{prompt}</p>
      {submitted && rating > 0 && (
        <p className="mt-2 text-sm font-semibold text-green-600">{receivedMessage}</p>
      )}
    </div>
  )
}
