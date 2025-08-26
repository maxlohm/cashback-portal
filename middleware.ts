// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const UUIDV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // 1) Supabase-Session hydratisieren (wichtig, dass das zuerst passiert)
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()

  // 2) ?ref=... -> Cookie setzen (danach, damit Set-Cookie sicher zusammengeführt wird)
  const ref = req.nextUrl.searchParams.get('ref')
  if (ref && UUIDV4.test(ref)) {
    const existing = req.cookies.get('bn_ref')?.value
    if (existing !== ref) {
      res.cookies.set('bn_ref', ref, {
        maxAge: 60 * 60 * 24 * 30, // 30 Tage
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
