'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function Footer() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setLoggedIn(!!data?.user)
      setLoadingAuth(false)
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <footer className="mt-20 bg-[#F1E8CB] text-[#003b5b] border-t border-[#d6c4a1] px-4 sm:px-8 py-10 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-semibold mb-2">Weitere beliebte Deals</h4>
          <ul className="space-y-1">
            <li><Link href="/" className="hover:underline">Zur Startseite</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Dein Bonus-Nest-Konto</h4>
          <ul className="space-y-1">
            {loadingAuth ? (
              <>
                <li className="text-gray-400">Lade...</li>
                <li className="text-gray-400">Lade...</li>
              </>
            ) : loggedIn ? (
              <>
                <li>
                  <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                </li>
                
                <li>
                  <button
                    onClick={handleLogout}
                    className="hover:underline text-left bg-transparent border-0 p-0 m-0 text-[#003b5b]"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className="hover:underline">Login</Link>
                </li>
                <li>
                  <Link href="/register" className="hover:underline">Registrieren</Link>
                </li>
                <li>
                  <Link href="/partner" className="hover:underline">Werde Partner</Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Sitemap</h4>
          <ul className="space-y-1">
            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link href="/support" className="hover:underline">Support</Link></li>
            <li><Link href="/datenschutz" className="hover:underline">Datenschutz</Link></li>
            <li><Link href="/agb" className="hover:underline">Nutzungsbedingungen</Link></li>
            <li><Link href="/impressum" className="hover:underline">Impressum</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Kontakt und Service</h4>
          <address className="not-italic space-y-1">  
            <p>Bonus-Nest<br />Khashayar Dehghani</p>
            <a
              href="mailto:info@bonus-nest.de"
              className="hover:underline text-[#0077b6] break-all"
            >
              info@bonus-nest.de
            </a>
          </address>
        </div>
      </div>

      <div className="text-center text-xs text-[#003b5b] mt-10 px-2">
        &copy; {new Date().getFullYear()} Bonus-Nest. Alle Rechte vorbehalten.
      </div>
    </footer>
  )
}
