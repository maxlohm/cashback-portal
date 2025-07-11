'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import Image from 'next/image'

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const menuRef = useRef(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setLoggedIn(true)
      }
      setLoadingAuth(false)
    }

    checkUser()

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !(menuRef.current as HTMLElement).contains(event.target as Node)
      ) {
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
    <header className="relative bg-[#F1E8CB] border-b border-[#d6c4a1] text-[#003b5b] z-50 overflow-visible">
      {/* Menü-Button oben rechts */}
      <div
        ref={menuRef}
        className="absolute top-14 right-8 z-50 object-contain w-[32px] h-[32px]"
      >
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full h-full px-1 py-0 bg-white border border-gray-300 rounded-md shadow hover:bg-gray-100 text-lg font-bold transition"
            aria-label="Menü öffnen"
          >
            ☰
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border shadow-lg rounded-md z-50 text-right overflow-hidden text-sm">
              <Link href="/" className="block px-4 py-2 hover:bg-gray-100">🏠 Angebote</Link>
              {!loadingAuth && loggedIn && (
                <>
                  <Link href="/profil-bearbeiten" className="block px-4 py-2 hover:bg-gray-100">👤 Mein Profil</Link>
                  <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">📊 Dashboard</Link>
                </>
              )}
              <Link href="/support" className="block px-4 py-2 hover:bg-gray-100">🛟 Support</Link>
              <Link href="/faq" className="block px-4 py-2 hover:bg-gray-100">❓ FAQ</Link>
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
                    <Link href="/login" className="block px-4 py-2 hover:bg-gray-100">🔐 Login</Link>
                    <Link href="/register" className="block px-4 py-2 hover:bg-gray-100">➕ Registrieren</Link>
                  </>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hauptinhalt: Logo – Schrift – Maus */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 sm:py-5">
        {/* Logo links */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/logo.png?updated=1"
              alt="Bonus-Nest Logo"
              width={120}
              height={120}
              className="object-contain w-24 sm:w-36"
            />
          </Link>
        </div>

        {/* Schriftzug mittig */}
        <div className="flex-grow flex justify-center">
          <Image
            src="/Bildschirmfoto%202025-07-07%20um%2018.34.57.png"
            alt="Bonus-Nest Schriftzug"
            width={340}
            height={80}
            className="object-contain max-w-full h-auto"
          />
        </div>

        {/* Maus rechts */}
        <div className="flex-shrink-0 relative -mt-[10px]">
          <Image
            src="/mouse-v2.png"
            alt="Maus"
            width={176}
            height={168}
            className="object-contain w-[176px] h-[168px]"
          />
        </div>
      </div>
    </header>
  )
}
