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
      {/* Menü-Button */}
      <div
        ref={menuRef}
        className="absolute top-6 sm:top-8 right-4 sm:right-8 z-50"
      >
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-gray-300 rounded-md shadow hover:bg-gray-100 text-xl font-bold transition"
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

      {/* Hauptinhalt */}
      <div className="flex justify-between items-center px-4 sm:px-8 py-6 sm:py-8 md:py-10 lg:py-12 gap-4">
        {/* Logo – 3/5 größer */}
        <div className="w-32 sm:w-44 md:w-56 flex-shrink-0">
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

        {/* Schriftzug – 3/5 größer */}
        <div className="flex-grow flex justify-center px-2">
          <div className="w-72 sm:w-96 md:w-[480px] lg:w-[520px]">
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
        </div>

        {/* Maus – 3/5 größer */}
        <div className="w-32 sm:w-44 md:w-56 flex-shrink-0 -mt-2 sm:-mt-4">
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
