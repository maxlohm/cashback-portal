import { NextResponse } from 'next/server'
const CRON_SECRET = process.env.CRON_SECRET!
const PURGE_AFTER_DAYS = Number(process.env.PURGE_AFTER_DAYS ?? 30)

async function purge() {
  // run as Service Role on the server
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await supabase.rpc('gdpr_purge_soft_deleted', { p_days: PURGE_AFTER_DAYS }) // optional helper; siehe „SQL“ unten
  if (error) throw error
  return data ?? { deleted: 0 }
}

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try { const res = await purge(); return NextResponse.json({ ok: true, ...res }) }
  catch (e:any) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }) }
}
export const POST = GET
