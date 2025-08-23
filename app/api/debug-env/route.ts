import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const projectRef = url.match(/https:\/\/(.*?)\.supabase\.co/)?.[1] || 'unknown'
  return NextResponse.json({
    projectRef,
    hasServiceRole: Boolean(srk),
    srkPreview: srk ? srk.slice(0, 8) + '…' : null,
  })
}
