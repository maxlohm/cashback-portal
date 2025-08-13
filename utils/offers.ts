// utils/offers.ts
import type { SupabaseClient } from '@supabase/supabase-js'

export type Offer = {
  id: string
  name: string
  description: string
  reward: number
  image?: string | null
  affiliateUrl?: string | null
  categories: ('versicherung' | 'kredit' | 'vergleiche' | 'finanzen' | 'mobilfunk')[]
  terms?: string[]
}

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
}

const mapDbToOffer = (row: DbOffer): Offer => ({
  id: row.id,
  name: row.title,
  description: row.description ?? '',
  reward: Number(row.reward_amount ?? 0),
  image: row.image_url ?? null,
  affiliateUrl: row.affiliate_url ?? null,
  categories: row.category ? [row.category as Offer['categories'][number]] : [],
  terms: [],
})

export async function getActiveOffers(
  supabase: SupabaseClient,
  opts: { limit?: number } = {}
): Promise<Offer[]> {
  const { limit = 100 } = opts
  const { data, error } = await supabase
    .from('offers')
    .select('id, title, description, reward_amount, advertiser_id, active, category, image_url, affiliate_url, created_at')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data as DbOffer[]).map(mapDbToOffer)
}

export async function getOfferById(
  supabase: SupabaseClient,
  id: string
): Promise<Offer | null> {
  const { data, error } = await supabase
    .from('offers')
    .select('id, title, description, reward_amount, advertiser_id, active, category, image_url, affiliate_url, created_at')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? mapDbToOffer(data as DbOffer) : null
}

/** Baut ?subid=<userId>|<offerId> an die Affiliate-URL an */
export function buildAffiliateUrl(
  baseUrl: string | null | undefined,
  userId: string,
  offerId: string
): string | null {
  if (!baseUrl) return null
  try {
    const u = new URL(baseUrl)
    u.searchParams.set('subid', `${userId}|${offerId}`)
    return u.toString()
  } catch {
    return baseUrl ?? null
  }
}
