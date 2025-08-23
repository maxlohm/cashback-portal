import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export async function requireAdmin() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, redirectTo: '/login' }

  const { data, error } = await supabase.rpc('is_admin')
  if (error || !data) return { ok: false as const, redirectTo: '/' }
  return { ok: true as const, supabase }
}
