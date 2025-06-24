'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import Image from 'next/image'

export default function Header() {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setLoggedIn(!!data?.user)
    }

    checkUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="bg-[#d0f0f7] border-b border-cyan-300 text-[#003b5b]">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Logo + Titel + Slogan */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/logo.png"
            alt="Bonus-Nest Logo"
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <h1 className="text-xl font-bold hover:text-[#008fc7] transition-colors">
              Bonus-Nest
            </h1>
            <p className="text-xs text-gray-700">
              Dein digitales Nest für Boni und Prämien
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-4 text-sm font-medium">
          <Link href="/" className="hover:text-[#008fc7]">Angebote</Link>
          <Link href="/support" className="hover:text-[#008fc7]">Support</Link>
          <Link href="/faq" className="hover:text-[#008fc7]">FAQ</Link>

          {loggedIn ? (
            <>
              <Link href="/dashboard" className="hover:text-[#008fc7]">Dashboard</Link>
              <Link href="/profil-bearbeiten" className="hover:text-[#008fc7]">Mein Profil</Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 ml-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-[#008fc7]">🔐 Login</Link>
              <Link href="/register" className="hover:text-[#008fc7]">➕ Registrieren</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
