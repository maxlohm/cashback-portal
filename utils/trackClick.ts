// utils/trackClick.ts

import { supabase } from '@/utils/supabaseClient'

export async function trackClick({
  userId,
  offerId,
  amount,
  url
}: {
  userId: string
  offerId: string
  amount: number
  url: string
}) {
  const subid = `${userId}|${offerId}`
  const fullUrl = url.includes('?') ? `${url}&subid=${subid}` : `${url}?subid=${subid}`

  // 1. Speichere den Klick in der Supabase-Datenbank
  await supabase.from('clicks').insert([
    {
      user_id: userId,
      offer_id: offerId,
      amount,
      clicked_at: new Date().toISOString(),
      redeemed: false
    }
  ])

  // 2. Öffne den Link in einem neuen Tab
  if (typeof window !== 'undefined') {
    window.open(fullUrl, '_blank')
  }
}
