// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const UUIDV4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // 1) ?ref=... aus jeder Seite mitnehmen → Cookie setzen (30 Tage)
  const ref = req.nextUrl.searchParams.get('ref')
  if (ref && UUIDV4.test(ref)) {
    const existing = req.cookies.get('bn_ref')?.value
    if (existing !== ref) {
      res.cookies.set('bn_ref', ref, {
        maxAge: 60 * 60 * 24 * 30, // 30 Tage
        path: '/',
        sameSite: 'lax',
      })
    }
  }

  // 2) Supabase-Session aktuell halten
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()

  return res
}

export const config = {
  // alles außer Next-Assets & Favicon; /api/ darf drin bleiben, schadet nicht
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
