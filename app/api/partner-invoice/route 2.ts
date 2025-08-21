import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { amount, mode } = await req.json() as { amount?: number; mode?: 'gross'|'net' }

    const val = Number(amount)
    if (!Number.isFinite(val) || val <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // ✅ in route handlers pass the cookies function directly
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const isGross = (mode ?? 'gross') === 'gross'
    const { error } = await supabase.rpc('create_partner_invoice', { p_amount: val, p_is_gross: isGross })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Bad request' }, { status: 400 })
  }
}
