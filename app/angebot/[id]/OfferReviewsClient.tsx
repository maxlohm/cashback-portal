'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Review = {
  id: string
  rating: number
  title: string | null
  comment: string | null
  created_at: string
  user_id: string
}

export default function OfferReviewsClient({ offerId }: { offerId: string }) {
  const supabase = createClientComponentClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [myReview, setMyReview] = useState<Review | null>(null)
  const [rating, setRating] = useState<number>(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const { data: authData } = await supabase.auth.getUser()
      const userId = authData?.user?.id ?? null

      const { data: all, error } = await supabase
        .from('offer_reviews')
        .select(
          'id, rating, title, comment, created_at, user_id'
        )
        .eq('offer_id', offerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      let mine: Review | null = null
      let others: Review[] = all || []

      if (userId && all) {
        const own = all.find((r) => r.user_id === userId)
        if (own) {
          mine = own
          others = all.filter((r) => r.user_id !== userId)
        }
      }

      setMyReview(mine)
      if (mine) {
        setRating(mine.rating)
        setTitle(mine.title ?? '')
        setComment(mine.comment ?? '')
      }
      setReviews(others)
      setLoading(false)
    }

    load()
  }, [offerId, supabase])

  const handleSave = async () => {
    if (!rating) return
    setSaving(true)

    const { data: authData } = await supabase.auth.getUser()
    const userId = authData?.user?.id

    if (!userId) {
      alert('Bitte einloggen, um eine Bewertung zu schreiben.')
      setSaving(false)
      return
    }

    if (myReview) {
      const { data, error } = await supabase
        .from('offer_reviews')
        .update({
          rating,
          title: title || null,
          comment: comment || null,
        })
        .eq('id', myReview.id)
        .select()
        .single()

      if (error) {
        console.error(error)
      } else if (data) {
        setMyReview(data as Review)
      }
    } else {
      const { data, error } = await supabase
        .from('offer_reviews')
        .insert({
          offer_id: offerId,
          user_id: userId,
          rating,
          title: title || null,
          comment: comment || null,
        })
        .select()
        .single()

      if (error) {
        console.error(error)
      } else if (data) {
        setMyReview(data as Review)
      }
    }

    setSaving(false)
  }

  if (loading) return null

  return (
    <div className="space-y-6">
      {/* Formular */}
      <div className="rounded-2xl border bg-white p-5 space-y-3">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setRating(v)}
              className="text-2xl"
            >
              {rating >= v ? '★' : '☆'}
            </button>
          ))}
          <span className="text-sm text-gray-600">
            {myReview
              ? 'Deine Bewertung bearbeiten'
              : 'Jetzt bewerten'}
          </span>
        </div>

        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Überschrift (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]"
          placeholder="Deine Erfahrung mit diesem Deal (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !rating}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#003b5b] px-4 text-white text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Speichern…' : 'Bewertung speichern'}
        </button>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {myReview && (
          <ReviewCard review={myReview} label="Deine Bewertung" />
        )}
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
        {!myReview && reviews.length === 0 && (
          <p className="text-sm text-gray-500">
            Bisher keine Bewertungen. Sei der erste, der diesen Deal bewertet.
          </p>
        )}
      </div>
    </div>
  )
}

function ReviewCard({ review, label }: { review: Review; label?: string }) {
  const date = new Date(review.created_at).toLocaleDateString('de-DE')

  return (
    <article className="rounded-2xl border bg-white p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex gap-1 text-base">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i}>
                {review.rating >= i ? '★' : '☆'}
              </span>
            ))}
          </div>
          {review.title && (
            <h3 className="mt-1 font-medium">{review.title}</h3>
          )}
        </div>
        <span className="text-xs text-gray-500">{date}</span>
      </div>
      {label && (
        <div className="text-xs text-blue-600 mt-1">{label}</div>
      )}
      {review.comment && (
        <p className="mt-2 text-gray-700 whitespace-pre-line">
          {review.comment}
        </p>
      )}
    </article>
  )
}
