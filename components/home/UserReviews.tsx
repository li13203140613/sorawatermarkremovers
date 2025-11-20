'use client'

interface Review {
  id: string
  userName: string
  avatar: string  // emoji 头像
  date: string
  rating: number
  comment: string
  likes?: number
  views?: number
}

interface UserReviewsProps {
  title: string
  subtitle: string
  reviews: Review[]
}

export default function UserReviews({ title, subtitle, reviews }: UserReviewsProps) {
  return (
    <div className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* User Info */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={review.avatar}
                    alt={review.userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{review.userName}</p>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg
                    key={index}
                    className={`w-5 h-5 ${
                      index < review.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.945a1 1 0 00.95.69h4.155c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.287 3.944c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.366 2.447c-.784.57-1.84-.197-1.54-1.118l1.286-3.944a1 1 0 00-.364-1.118L2.65 9.372c-.783-.57-.38-1.81.588-1.81h4.154a1 1 0 00.951-.69l1.286-3.945z" />
                  </svg>
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.comment}</p>

              {/* Stats (optional) */}
              {(review.likes || review.views) && (
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                  {review.likes !== undefined && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span className="text-xs font-medium">{review.likes}</span>
                    </div>
                  )}
                  {review.views !== undefined && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span className="text-xs font-medium">{review.views}k</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
