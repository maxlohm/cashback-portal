// utils/offers.ts
import type { SupabaseClient } from '@supabase/supabase-js'

/** App-internes Offer-Model */
export type Offer = {
  id: string
  name: string
  description: string
  reward: number
  image?: string | null
  affiliateUrl?: string | null
  categories: (
    | 'versicherung'
    | 'kredit'
    | 'vergleiche'
    | 'finanzen'
    | 'mobilfunk'
    | 'shopping'
  )[]
  /** Teilnahmebedingungen (aus DB-Spalte `offers.terms`) */
  terms?: string | null
  active?: boolean
}

/** DB-Rohdatensatz aus public.offers */
export type DbOffer = {
  id: string
  title: string
  description: string | null
  reward_amount: number | null
  advertiser_id: string | null
  active: boolean
  category: string | null
  image_url?: string | null
  affiliate_url?: string | null
  created_at: string
  terms?: string | null
}

/** DB -> App Mapping */
const mapDbToOffer = (row: DbOffer): Offer => ({
  id: row.id,
  name: row.title,
  description: row.description ?? '',
  reward: Number(row.reward_amount ?? 0),
  image: row.image_url ?? null,
  affiliateUrl: row.affiliate_url ?? null,
  categories: row.category ? [row.category as Offer['categories'][number]] : [],
  terms: row.terms ?? null,
  active: row.active,
})

/** Basis-Select */
const baseSelect =
  'id, title, description, reward_amount, advertiser_id, active, category, image_url, affiliate_url, created_at, terms'

/** Alle aktiven Offers (optional limitiert) */
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

/** Aktive Offers nach Kategorien */
export async function getActiveOffersByCategories(
  supabase: SupabaseClient,
  categories: Array<
    'finanzen' | 'kredit' | 'versicherung' | 'vergleiche' | 'mobilfunk' | 'shopping'
  >,
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

/** Einzelnes Offer per ID */
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

/* ===========================
   Affiliate-URL-Helfer
   =========================== */

type SubIdParts = {
  userId: string
  offerId: string
  influencerId?: string | null
  /** Optional: Admin-SubID (profiles.partner_subid) – hat Vorrang */
  subId?: string | null
  /** Optional: Click-Token (falls vorhanden) */
  clickToken?: string | null
}

/** Baut den SubID-Token: subId > clickToken > user|offer|influencer */
function buildSubId(parts: SubIdParts): string {
  const s = (parts.subId || '').trim()
  if (s.length > 0) return s
  const c = (parts.clickToken || '').trim()
  if (c.length > 0) return c
  const infl = parts.influencerId ?? 'none'
  return `${parts.userId}|${parts.offerId}|${infl}`
}

/** Param-Name je Netzwerk */
function detectSubIdParam(hostname: string): 'clickref' | 'subid' | 'smc1' {
  const h = hostname.toLowerCase()
  if (h.includes('awin1.com')) return 'clickref'                 // AWIN
  if (h.includes('financeads.net')) return 'subid'               // financeAds
  if (h.includes('belboon') || h.includes('janus.r.jakuli.com')) return 'smc1' // belboon
  return 'subid' // Fallback
}

/** Baut die Affiliate-URL mit SubID & optional influencer ref */
export function buildAffiliateUrl(
  baseUrl: string | null | undefined,
  parts: SubIdParts
): string | null {
  if (!baseUrl) return null
  try {
    const u = new URL(baseUrl)

    // 1) SubID setzen (netzwerkabhängiger Param)
    const key = detectSubIdParam(u.hostname)
    const token = buildSubId(parts)
    u.searchParams.set(key, token)

    // 2) (Optional) Influencer separat mitgeben – falls euer Netzwerk 'ref' o.ä. nutzt
    if (parts.influencerId) {
      // Param ggf. anpassen (ref / aff_id / publisherId ...)
      u.searchParams.set('ref', parts.influencerId)
    }

    // 3) Immer nützliche Standard-Parameter (internes Debugging)
    u.searchParams.set('uid', parts.userId)
    u.searchParams.set('oid', parts.offerId)

    return u.toString()
  } catch {
    return baseUrl ?? null
  }
}

/** Legacy-Wrapper (Kompatibilität) */
export function buildAffiliateUrlLegacy(
  baseUrl: string | null | undefined,
  userId: string,
  offerId: string
): string | null {
  return buildAffiliateUrl(baseUrl, { userId, offerId })
}
