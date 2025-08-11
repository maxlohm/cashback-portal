import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabaseClient'

// POST /api/affiliate-lead
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { subid, amount, status, network } = body

    if (!subid || !subid.includes('|')) {
      return NextResponse.json({ error: 'Ungültige SubID' }, { status: 400 })
    }

    const [userId, offerId] = subid.split('|')

    // Letzten Klick finden
    const { data: click, error: clickError } = await supabase
      .from('clicks')
      .select('id')
      .eq('user_id', userId)
      .eq('offer_id', offerId)
      .order('clicked_at', { ascending: false })
      .limit(1)
      .single()

    if (clickError || !click) {
      return NextResponse.json({ error: 'Kein passender Klick gefunden' }, { status: 404 })
    }

    // Lead eintragen
    const { error: leadError } = await supabase.from('leads').insert({
      click_id: click.id,
      amount: amount || 10.0,
      confirmed: status === 'confirmed',
      confirmed_at: status === 'confirmed' ? new Date().toISOString() : null,
    })

    if (leadError) {
      return NextResponse.json({ error: 'Lead konnte nicht gespeichert werden' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Lead gespeichert für user ${userId}`, network })

  } catch (err) {
    console.error('Webhook Error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
