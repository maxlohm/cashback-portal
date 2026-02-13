import type { SupabaseClient } from '@supabase/supabase-js'

/* ===========================
   Offer Types
   =========================== */

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
    | 'gratis'
  )[]
  terms?: string | null
  active?: boolean
}

type DbOffer = {
  id: string
  title: string | null
  description: string | null
  reward_amount: number | null
  image_url: string | null
  affiliate_url: string | null
  active: boolean | null
  category: string | null
  terms: string | null
  created_at: string | null
}

/* ===========================
   Mapper
   =========================== */

function mapOffer(r: DbOffer): Offer {
  const cat = (r.category ?? '') as Offer['categories'][number] | ''

  return {
    id: r.id,
    name: r.title ?? 'Angebot',
    description: r.description ?? '',
    reward: Number(r.reward_amount ?? 0),
    image: r.image_url ?? null,
    affiliateUrl: r.affiliate_url ?? null,
    categories: cat ? [cat] : [],
    terms: r.terms ?? null,
    active: Boolean(r.active),
  }
}

/* ===========================
   Fetch: Alle aktiven Offers
   =========================== */

export async function getActiveOffers(
  supabase: SupabaseClient,
  opts?: { limit?: number; category?: Offer['categories'][number] }
): Promise<Offer[]> {
  const limit = opts?.limit ?? 200

  let q = supabase
    .from('offers')
    .select(
      'id,title,description,reward_amount,image_url,affiliate_url,active,category,terms,created_at'
    )
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (opts?.category) {
    q = q.eq('category', opts.category)
  }

  const { data, error } = await q

  if (error) throw error

  return (data ?? []).map(mapOffer)
}

/* ===========================
   Fetch: Mehrere Kategorien
   =========================== */

export async function getActiveOffersByCategories(
  supabase: SupabaseClient,
  categories: Offer['categories'][number][],
  opts?: { limit?: number }
): Promise<Offer[]> {
  const limit = opts?.limit ?? 200

  const { data, error } = await supabase
    .from('offers')
    .select(
      'id,title,description,reward_amount,image_url,affiliate_url,active,category,terms,created_at'
    )
    .eq('active', true)
    .in('category', categories)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map(mapOffer)
}

/* ===========================
   Fetch: Offer by ID
   =========================== */

export async function getOfferById(
  supabase: SupabaseClient,
  id: string
): Promise<Offer | null> {
  const { data, error } = await supabase
    .from('offers')
    .select(
      'id,title,description,reward_amount,image_url,affiliate_url,active,category,terms,created_at'
    )
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return mapOffer(data as DbOffer)
}
