// Datei: app/api/partner-webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabaseServer'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const body = await req.json()

  // Sicherheitsschlüssel prüfen
  const authHeader = req.headers.get('Authorization') || ''
  const partnerSecret = process.env.PARTNER_SECRET_KEY

  if (!authHeader || authHeader !== `Bearer ${partnerSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Erwartete Felder vom Partner (z. B. Check24, Verivox, etc.)
  const { user_id, offer_id, amount } = body

  if (!user_id || !offer_id || !amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Den passenden Click finden
  const { data: click, error } = await supabase
    .from('clicks')
    .select('*')
    .eq('user_id', user_id)
    .eq('offer_id', offer_id)
    .order('clicked_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !click) {
    return NextResponse.json({ error: 'Click not found' }, { status: 404 })
  }

  // Update: amount setzen → Deal wurde abgeschlossen
  const { error: updateError } = await supabase
    .from('clicks')
    .update({ amount })
    .eq('id', click.id)

  if (updateError) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}