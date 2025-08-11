import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side, RLS-bypass
)

export async function POST(req: NextRequest) {
  try {
    // Optional: Secret prüfen
    const secret = req.headers.get('x-webhook-secret')
    if (process.env.TREMENDOUS_WEBHOOK_SECRET && secret !== process.env.TREMENDOUS_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()
    // Tremendous sollte 'external_id' (unsere redemption.id) und 'status' liefern
    const redemptionId: string | undefined = payload?.external_id
    const status: string | undefined = payload?.status

    // Logge das rohe Webhook-Event
    await supabase.from('event_log').insert([{
      event_type: 'tremendous_webhook_received',
      related_id: redemptionId,
      context: payload
    }])

    if (!redemptionId || !status) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    // Wenn geliefert/ausgezahlt, setze paid
    if (String(status).toLowerCase() === 'delivered') {
      const { error } = await supabase
        .from('redemptions')
        .update({ status: 'paid' })
        .eq('id', redemptionId)

      if (error) {
        await supabase.from('event_log').insert([{
          event_type: 'tremendous_update_failed',
          related_id: redemptionId,
          context: { error: error.message }
        }])
        return NextResponse.json({ error: 'Failed to update redemption' }, { status: 500 })
      }

      await supabase.from('event_log').insert([{
        event_type: 'tremendous_marked_paid',
        related_id: redemptionId
      }])
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    await supabase.from('event_log').insert([{
      event_type: 'tremendous_webhook_error',
      context: { error: String(err) }
    }])
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
