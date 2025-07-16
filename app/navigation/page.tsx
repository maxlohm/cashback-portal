'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const categories = [
  { name: 'Alle Deals', href: '/' },
  { name: 'Finanzen', href: '/finanzen' },
  { name: 'Versicherungen', href: '/versicherungen' },
  { name: 'Mobilfunk', href: '/mobilfunk' },
  { name: 'Gratis', href: '/gratis' },
  { name: 'Shopping', href: '/shopping' },
  { name: 'Vergleiche', href: '/preisvergleich' },
]

export default function KategorieNavigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-[#f7f3e6] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {categories.map((cat) => {
            const isActive =
              cat.href === '/'
                ? pathname === '/'
                : pathname.startsWith(cat.href)

            return (
              <Link
                key={cat.href}
                href={cat.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-[#003b5b] text-white'
                      : 'bg-[#f1e8cc] text-[#003b5b] hover:bg-[#e4d8b8] hover:shadow-sm'
                  }`}
              >
                {cat.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
