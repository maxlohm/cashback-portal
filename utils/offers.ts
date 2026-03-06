// utils/offers.ts
import type { SupabaseClient } from '@supabase/supabase-js'

/* =========================================
   Kategorien-Typ
========================================= */

export type OfferCategory =
  | 'versicherung'
  | 'kredit'
  | 'vergleiche'
  | 'finanzen'
  | 'mobilfunk'
  | 'shopping'
  | 'gratis'

/* =========================================
   App-internes Offer-Model
========================================= */

export type Offer = {
  id: string
  name: string
  description: string

  /** Bonus-Nest Prämie */
  reward: number

  /** Anbieter-Bonus (optional) */
  providerBonusAmount?: number | null
  providerBonusText?: string | null

  image?: string | null
  affiliateUrl?: string | null
  categories: OfferCategory[]
  terms?: string | null
  active?: boolean

  /** Reviews */
  avgRating?: number | null
  reviewCount?: number
  latestReviewTitle?: string | null
  latestReviewComment?: string | null
}

/* =========================================
   DB-Rohdatensatz aus RPC
========================================= */

export type DbOffer = {
  id: string
  title: string
  description: string | null
  reward_amount: number | null
  provider_bonus_amount?: number | null
  provider_bonus_text?: string | null
  category: string | null
  image_url?: string | null
  affiliate_url?: string | null
  terms?: string | null
  active?: boolean

  avg_rating?: number | null
  review_count?: number | null
  latest_review_title?: string | null
  latest_review_comment?: string | null
}

/* =========================================
   DB -> App Mapping
========================================= */

const mapDbToOffer = (row: DbOffer): Offer => ({
  id: row.id,
  name: row.title,
  description: row.description ?? '',

  reward: Number(row.reward_amount ?? 0),

  providerBonusAmount:
    typeof row.provider_bonus_amount === 'number'
      ? Number(row.provider_bonus_amount)
      : row.provider_bonus_amount ?? null,

  providerBonusText: row.provider_bonus_text ?? null,

  image: row.image_url ?? null,
  affiliateUrl: row.affiliate_url ?? null,

  categories: row.category ? [row.category as OfferCategory] : [],

  terms: row.terms ?? null,
  active: row.active ?? true,

  avgRating:
    typeof row.avg_rating === 'number'
      ? Number(row.avg_rating)
      : row.avg_rating ?? null,

  reviewCount:
    typeof row.review_count === 'number'
      ? Number(row.review_count)
      : Number(row.review_count ?? 0),

  latestReviewTitle: row.latest_review_title ?? null,
  latestReviewComment: row.latest_review_comment ?? null,
})

/* =========================================
   Alle aktiven Offers
========================================= */

export async function getActiveOffers(
  supabase: SupabaseClient,
  opts: { limit?: number } = {},
): Promise<Offer[]> {
  const { limit = 100 } = opts

  const { data, error } = await supabase.rpc('get_active_offers_with_reviews')

  if (error) throw error

  return ((data as DbOffer[]) ?? []).slice(0, limit).map(mapDbToOffer)
}

/* =========================================
   Aktive Offers nach Kategorien
========================================= */

export async function getActiveOffersByCategories(
  supabase: SupabaseClient,
  categories: OfferCategory[],
  opts: { limit?: number } = {},
): Promise<Offer[]> {
  const { limit = 100 } = opts

  const offers = await getActiveOffers(supabase, { limit: 500 })

  const filtered =
    categories.length > 0
      ? offers.filter(offer =>
          offer.categories.some(cat => categories.includes(cat)),
        )
      : offers

  return filtered.slice(0, limit)
}

/* =========================================
   Einzelnes Offer per ID
========================================= */

export async function getOfferById(
  supabase: SupabaseClient,
  id: string,
): Promise<Offer | null> {
  const offers = await getActiveOffers(supabase, { limit: 500 })
  return offers.find(o => o.id === id) ?? null
}

/* =========================================
   Affiliate-Tracking Helpers
========================================= */

type SubIdParts = {
  userId: string
  offerId: string
  influencerId?: string | null
  subId?: string | null
  clickToken?: string | null
  targetUrl?: string | null
}

/* SubID-Priorität:
   1) profiles.partner_subid
   2) clickToken
   3) user|offer|influencer
*/
function buildSubId(parts: SubIdParts): string {
  const s = (parts.subId || '').trim()
  if (s.length > 0) return s

  const c = (parts.clickToken || '').trim()
  if (c.length > 0) return c

  const infl = parts.influencerId ?? 'none'
  return `${parts.userId}|${parts.offerId}|${infl}`
}

/* Netzwerkabhängiger Param */
function detectSubIdParam(hostname: string): 'clickref' | 'subid' | 'smc1' {
  const h = hostname.toLowerCase()

  if (h.includes('awin1.com')) return 'clickref'
  if (h.includes('financeads.net')) return 'subid'
  if (h.includes('belboon') || h.includes('janus.r.jakuli.com')) return 'smc1'

  return 'subid'
}

function isCommunicationAdsUrl(u: URL) {
  return u.pathname.toLowerCase().endsWith('/tc.php')
}

/* Hauptfunktion: Affiliate URL bauen */
export function buildAffiliateUrl(
  baseUrl: string | null | undefined,
  parts: SubIdParts,
): string | null {
  if (!baseUrl) return null

  try {
    const u = new URL(baseUrl)

    if (isCommunicationAdsUrl(u)) {
      const token = buildSubId(parts)

      u.searchParams.set('subid', token)

      const target = (parts.targetUrl || '').trim()
      if (target.length > 0) {
        u.searchParams.set('deeplink', target)
      }

      return u.toString()
    }

    const key = detectSubIdParam(u.hostname)
    const token = buildSubId(parts)
    u.searchParams.set(key, token)

    if (parts.influencerId) {
      u.searchParams.set('ref', parts.influencerId)
    }

    u.searchParams.set('uid', parts.userId)
    u.searchParams.set('oid', parts.offerId)

    return u.toString()
  } catch {
    return baseUrl ?? null
  }
}

/* Legacy-Wrapper */
export function buildAffiliateUrlLegacy(
  baseUrl: string | null | undefined,
  userId: string,
  offerId: string,
): string | null {
  return buildAffiliateUrl(baseUrl, { userId, offerId })
}