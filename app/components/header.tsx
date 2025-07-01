'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import Image from 'next/image'

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setLoggedIn(!!data?.user)
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
    <header className="relative bg-[#d0f0f7] border-b border-cyan-300 text-[#003b5b] z-50 overflow-hidden">
      {/* 🐭 Mausgrafik – nur ab sm sichtbar */}
      <div className="hidden sm:block absolute top-[-30px] right-6 z-10 w-[200px] sm:w-[250px] lg:w-[300px] h-auto">
        <Image
          src="/mouse-v2.png"
          alt="Mouse"
          fill
          className="object-contain pointer-events-none select-none"
        />
      </div>

      {/* Menübutton oben rechts */}
      <div ref={menuRef} className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-white border border-cyan-300 rounded-md shadow hover:bg-cyan-100 text-xl font-bold transition"
          aria-label="Menü öffnen"
        >
          ☰
        </button>

        {menuOpen && (
          <div className="mt-2 w-44 bg-white border shadow-lg rounded-md z-50 text-right">
            <Link href="/" className="block px-4 py-2 hover:bg-gray-100">Angebote</Link>
            <Link href="/support" className="block px-4 py-2 hover:bg-gray-100">Support</Link>
            <Link href="/faq" className="block px-4 py-2 hover:bg-gray-100">FAQ</Link>
            {loggedIn ? (
              <>
                <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">Dashboard</Link>
                <Link href="/profil-bearbeiten" className="block px-4 py-2 hover:bg-gray-100">Mein Profil</Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-red-600 hover:bg-gray-100 text-right"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-2 hover:bg-gray-100">🔐 Login</Link>
                <Link href="/register" className="block px-4 py-2 hover:bg-gray-100">➕ Registrieren</Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Logo + Titel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center px-4 sm:px-6 pt-4 sm:pt-6 pb-8 sm:pb-10 min-h-[200px] sm:min-h-[280px] relative z-10">
        <Link href="/" className="flex items-center space-x-4 z-20">
          <Image
            src="/logo.png"
            alt="Bonus-Nest Logo"
            width={100}
            height={100}
            className="rounded-full w-20 h-20 sm:w-32 sm:h-32 object-cover"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold hover:text-[#008fc7] transition-colors">
              Bonus-Nest
            </h1>
            <p className="text-sm sm:text-base text-gray-700">
              Dein digitales Nest für Boni und Prämien
            </p>
          </div>
        </Link>
      </div>
    </header>
  )
}
