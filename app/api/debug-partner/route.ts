import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = process.env.SUPABASE_URL
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !srk) {
    return NextResponse.json({ ok:false, error:'missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY' }, { status:500 })
  }
  const supabase = createClient(url, srk)
  const apiKey = new URL(req.url).searchParams.get('key') ?? 'pk_dev_max_1'
  const { data, error, count } = await supabase
    .from('partners')
    .select('id, name, api_key', { count: 'exact' })
    .eq('api_key', apiKey)

  return NextResponse.json({ ok:true, count, rows: data ?? [], error: error?.message ?? null })
}
