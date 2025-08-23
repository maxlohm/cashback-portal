import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.SUPABASE_URL
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !srk) {
    return NextResponse.json({ ok:false, error:'missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }, { status:500 })
  }

  const endpoint = `${url}/rest/v1/partners?select=id&limit=1`
  const res = await fetch(endpoint, {
    headers: {
      apikey: srk,
      Authorization: `Bearer ${srk}`,
      'Accept': 'application/json',
    },
  })

  const text = await res.text()
  return NextResponse.json({
    ok: true,
    endpoint,
    status: res.status,
    statusText: res.statusText,
    body: text,
    urlEnv: url,
    srkStartsWith: srk.slice(0,8)+'…',
    srkLength: srk.length,
  })
}
