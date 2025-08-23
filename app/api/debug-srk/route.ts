import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function decode(base64: string) {
  try { return JSON.parse(Buffer.from(base64, 'base64').toString('utf8')) } catch { return null }
}

export async function GET() {
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!srk) return NextResponse.json({ ok:false, error:'no SRK set' }, { status:500 })

  const parts = srk.split('.')
  const payload = parts.length >= 2 ? decode(parts[1]) : null
  const ref = payload?.ref || payload?.project_id || null

  return NextResponse.json({
    ok: true,
    srkHasValue: Boolean(srk),
    srkStartsWith: srk.slice(0, 8) + '…',
    refInToken: ref || 'UNKNOWN',
  })
}
