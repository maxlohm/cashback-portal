import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export async function POST() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user }, error: aerr } = await supabase.auth.getUser()
  if (aerr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.rpc('gdpr_soft_delete_user', { p_user: user.id, p_reason: 'user_request' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Log out
  await supabase.auth.signOut()
  return NextResponse.json({ ok: true })
}
