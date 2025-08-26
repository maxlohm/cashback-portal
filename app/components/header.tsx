'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [isPartner, setIsPartner] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (user) {
        setLoggedIn(true)

        // Partner-Check über user_id
        const { data: partner } = await supabase
          .from('partners')
          .select('id')
          .eq('user_id', user.id)       // Fix: user_id statt id
          .maybeSingle()

        // Admin-Check über RPC
        const { data: isAdminFlag } = await supabase.rpc('is_admin')

        setIsPartner(!!partner || isAdminFlag === true) // Admin darf auch Partner-Dashboard sehen
        setIsAdmin(isAdminFlag === true)
      }

      setLoadingAuth(false)
    }

    checkUser()
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="relative bg-[#F1E8CB] border-b border-[#d6c4a1] text-[#003b5b] z-50">
      {/* Menü-Button */}
      <div ref={menuRef} className="absolute top-4 right-4 z-50 sm:top-6 sm:right-6">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-gray-300 rounded-md shadow hover:bg-gray-100 text-xl font-bold transition"
            aria-label="Menü öffnen"
          >
            ☰
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border shadow-lg rounded-md z-50 text-right overflow-hidden text-sm">
              <Link href="/" className="block px-4 py-2 hover:bg-gray-100">Angebote</Link>

              {!loadingAuth && loggedIn && (
                <>
                  <Link href="/profil-bearbeiten" className="block px-4 py-2 hover:bg-gray-100">Mein Profil</Link>
                  <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">Dashboard</Link>

                  {isPartner && (
                    <Link href="/partner-dashboard" className="block px-4 py-2 hover:bg-gray-100">
                      Partner-Dashboard
                    </Link>
                  )}

                  {isAdmin && (
                    <>
                      <div className="px-4 pt-2 text-xs text-gray-500">Admin</div>
                      <Link href="/admin/redemptions" className="block px-4 py-2 hover:bg-gray-100">
                        Admin-Dashboard
                      </Link>
                      <Link href="/admin/users" className="block px-4 py-2 hover:bg-gray-100">
                        Nutzerverwaltung
                      </Link>
                    </>
                  )}
                </>
              )}

              <Link href="/support" className="block px-4 py-2 hover:bg-gray-100">Support</Link>
              <Link href="/faq" className="block px-4 py-2 hover:bg-gray-100">FAQ</Link>

              {!loadingAuth && (
                loggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    🔓 Logout
                  </button>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2 hover:bg-gray-100">Login</Link>
                    <Link href="/register" className="block px-4 py-2 hover:bg-gray-100">Registrieren</Link>
                  </>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Header-Inhalte */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-3 sm:py-7 gap-3 sm:gap-6">
        {/* Logo */}
        <div className="w-36 sm:w-40 md:w-44">
          <Link href="/">
            <Image
              src="/Bonus-Nest_1024px.png"
              alt="Bonus-Nest Logo"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Schriftzug */}
        <div className="w-52 sm:w-80 md:w-[360px] lg:w-[400px]">
          <Image
            src="/Logo_Schrift.png"
            alt="Bonus-Nest Schriftzug"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* Maus – Mobil ausgeblendet */}
        <div className="hidden sm:block w-36 md:w-44 -mt-4">
          <Image
            src="/LogoMouse_rechts_Retusche.webp"
            alt="Bonus-Nest Maus"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      </div>
    </header>
  )
}
