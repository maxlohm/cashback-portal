import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'not-authenticated' }, { status: 401 })

  const { data } = await supabase
    .from('clicks')
    .select('id, offer_id, clicked_at')
    .eq('user_id', user.id)
    .order('clicked_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return NextResponse.json({ ok: false, error: 'no-click-found' }, { status: 404 })
  return NextResponse.json({ ok: true, click_id: data.id, offer_id: data.offer_id, clicked_at: data.clicked_at })
}
