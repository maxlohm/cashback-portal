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
}

/* =========================================
   DB-Rohdatensatz aus public.offers
========================================= */

export type DbOffer = {
  id: string
  title: string
  description: string | null

  reward_amount: number | null

  // NEU:
  provider_bonus_amount?: number | null
  provider_bonus_text?: string | null

  advertiser_id: string | null
  active: boolean
  category: string | null
  image_url?: string | null
  affiliate_url?: string | null
  created_at: string
  terms?: string | null
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
  active: row.active,
})

/* =========================================
   Basis-Select
========================================= */

const baseSelect =
  'id, title, description, reward_amount, provider_bonus_amount, provider_bonus_text, advertiser_id, active, category, image_url, affiliate_url, created_at, terms'

/* =========================================
   Alle aktiven Offers
========================================= */

export async function getActiveOffers(
  supabase: SupabaseClient,
  opts: { limit?: number } = {}
): Promise<Offer[]> {
  const { limit = 100 } = opts

  const { data, error } = await supabase
    .from('offers')
    .select(baseSelect)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data as DbOffer[]).map(mapDbToOffer)
}

/* =========================================
   Aktive Offers nach Kategorien
========================================= */

export async function getActiveOffersByCategories(
  supabase: SupabaseClient,
  categories: OfferCategory[],
  opts: { limit?: number } = {}
): Promise<Offer[]> {
  const { limit = 100 } = opts

  const { data, error } = await supabase
    .from('offers')
    .select(baseSelect)
    .eq('active', true)
    .in('category', categories)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data as DbOffer[]).map(mapDbToOffer)
}

/* =========================================
   Einzelnes Offer per ID
========================================= */

export async function getOfferById(
  supabase: SupabaseClient,
  id: string
): Promise<Offer | null> {
  const { data, error } = await supabase
    .from('offers')
    .select(baseSelect)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? mapDbToOffer(data as DbOffer) : null
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

/* Hauptfunktion: Affiliate URL bauen */
export function buildAffiliateUrl(
  baseUrl: string | null | undefined,
  parts: SubIdParts
): string | null {
  if (!baseUrl) return null

  try {
    const u = new URL(baseUrl)

    // 1) SubID setzen
    const key = detectSubIdParam(u.hostname)
    const token = buildSubId(parts)
    u.searchParams.set(key, token)

    // 2) Optional Influencer separat übergeben
    if (parts.influencerId) {
      u.searchParams.set('ref', parts.influencerId)
    }

    // 3) Debug-Parameter (intern)
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
  offerId: string
): string | null {
  return buildAffiliateUrl(baseUrl, { userId, offerId })
}