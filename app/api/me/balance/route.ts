// app/api/me/balance/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: userRes } = await supabase.auth.getUser()
  if (!userRes?.user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const { data, error } = await supabase.rpc('get_user_balance')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, balance: data })
}
