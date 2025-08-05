// utils/updateRewardStatus.ts

import { supabase } from '@/utils/supabaseClient'

/**
 * Diese Funktion setzt eine Prämie für einen bestimmten Klick auf bestätigt (confirmed).
 * Sie kann später auch als Admin-Tool oder durch einen Webhook aufgerufen werden.
 */
export async function confirmReward(clickId: number) {
  const { data, error } = await supabase
    .from('clicks')
    .update({ confirmed: true })
    .eq('id', clickId)

  if (error) throw new Error(error.message)
  return data
}

/**
 * Diese Funktion setzt eine bestätigte Prämie als ausgezahlt (paid).
 * Nur anwendbar, wenn bereits "confirmed = true" gesetzt ist.
 */
export async function markAsPaid(clickId: number) {
  const { data, error } = await supabase
    .from('clicks')
    .update({ paid: true })
    .eq('id', clickId)
    .eq('confirmed', true)

  if (error) throw new Error(error.message)
  return data
}
