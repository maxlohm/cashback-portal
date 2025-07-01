'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#d0f0f7] text-[#003b5b] px-4 sm:px-6 py-10 border-t border-cyan-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="font-semibold mb-2">Weitere beliebte Deals</h4>
          <ul className="space-y-1">
            <li>
              <Link href="/" className="hover:underline">Zur Startseite</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Dein HydroCash-Konto</h4>
          <ul className="space-y-1">
            <li><Link href="/login" className="hover:underline">Login</Link></li>
            <li><Link href="/register" className="hover:underline">Registrieren</Link></li>
            <li><Link href="/partner" className="hover:underline">Partner</Link></li>
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
          <p className="space-y-1 text-sm">
            HydroCash GbR<br />
            Jan Biefang &amp; Max Lohmann<br />
            <a
              href="mailto:hydroahsdjdsfgd@gmail.com"
              className="hover:underline text-[#0077b6] break-all"
            >
              hydroahsdjdsfgd@gmail.com
            </a>
          </p>
        </div>
      </div>

      <div className="text-center text-xs text-[#003b5b] mt-10 px-2">
        &copy; {new Date().getFullYear()} HydroCash. Alle Rechte vorbehalten.
      </div>
    </footer>
  )
}
