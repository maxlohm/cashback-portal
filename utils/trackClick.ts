import { supabase } from './supabaseClient'

export const trackClick = async (userId: string, offerId: string) => {
  const { error } = await supabase.from('clicks').insert([
    {
      user_id: userId,
      offer_id: offerId,
    },
  ])

  if (error) {
    console.error('Fehler beim Klick-Tracking:', error)
  }
}
