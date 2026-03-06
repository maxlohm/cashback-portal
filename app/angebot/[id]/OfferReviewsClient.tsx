'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type OfferReviewsClientProps = {
  offerId: string
}

type ReviewRow = {
  id: string
  rating: number
  title: string | null
  comment: string | null
  created_at: string
}

const INITIAL_VISIBLE_REVIEWS = 5

export default function OfferReviewsClient({
  offerId,
}: OfferReviewsClientProps) {
  const supabase = useMemo(() => createClientComponentClient(), [])

  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllReviews, setShowAllReviews] = useState(false)

  useEffect(() => {
    let alive = true

    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('offer_reviews')
          .select('id, rating, title, comment, created_at')
          .eq('offer_id', offerId)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (!alive) return

        const mapped: ReviewRow[] = (data ?? []).map((row: any) => ({
          id: row.id,
          rating: Number(row.rating || 0),
          title: row.title ?? null,
          comment: row.comment ?? null,
          created_at: row.created_at,
        }))

        setReviews(mapped)
      } catch (e: any) {
        if (!alive) return
        setError(e?.message ?? 'Fehler beim Laden der Bewertungen')
      } finally {
        if (!alive) return
        setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [supabase, offerId])

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }, [reviews])

  const visibleReviews = useMemo(() => {
    return showAllReviews
      ? reviews
      : reviews.slice(0, INITIAL_VISIBLE_REVIEWS)
  }, [reviews, showAllReviews])

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-5 text-sm text-gray-500">
        Lade Bewertungen…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border bg-white p-5 text-sm text-red-600">
        Fehler: {error}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-5 text-sm text-gray-500">
        Noch keine Bewertungen vorhanden.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-lg font-semibold text-[#003b5b]">
            {renderStars(avgRating)}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">{avgRating.toFixed(1)} / 5</span>
            <span className="text-gray-500"> · {reviews.length} Bewertungen</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {visibleReviews.map(review => (
          <article
            key={review.id}
            className="rounded-2xl border bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[#003b5b]">
                  {review.title?.trim() || 'Bewertung'}
                </div>
                <div className="mt-1 text-sm text-[#ca4b24]">
                  {renderStars(review.rating)}
                </div>
              </div>

              <div className="shrink-0 text-xs text-gray-400">
                {formatDate(review.created_at)}
              </div>
            </div>

            {review.comment?.trim() && (
              <p className="mt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                {review.comment}
              </p>
            )}
          </article>
        ))}
      </div>

      {reviews.length > INITIAL_VISIBLE_REVIEWS && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllReviews(v => !v)}
            className="inline-flex items-center rounded-xl border border-black/5 bg-white px-4 py-2 text-sm font-medium text-[#003b5b] hover:bg-gray-50 transition"
          >
            {showAllReviews
              ? 'Weniger Bewertungen anzeigen'
              : `Alle ${reviews.length} Bewertungen anzeigen`}
          </button>
        </div>
      )}
    </div>
  )
}

function renderStars(rating: number) {
  const rounded = Math.round(Number(rating || 0))
  return Array.from({ length: 5 }, (_, i) => (i < rounded ? '★' : '☆')).join('')
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}