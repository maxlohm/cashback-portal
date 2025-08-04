import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient({ req, res })
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.warn('Supabase Session Error:', error.message)
    }

    // Optional: Zugriffsschutz direkt hier (z. B. redirect, wenn nicht eingeloggt)
    // if (!data.session) {
    //   return NextResponse.redirect(new URL('/login', req.url))
    // }

  } catch (err: any) {
    console.error('Middleware Error:', err.message || err)
    // NICHT redirecten oder crashen – einfach Response zurückgeben
  }

  return res
}

export const config = {
  matcher: ['/partner-dashboard'],
}
