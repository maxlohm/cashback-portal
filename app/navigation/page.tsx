'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const categories = [
  { name: 'Alle Deals', href: '/alleDeals' },
  { name: 'Finanzen', href: '/finanzen' },
 { name: 'Versicherungen', href: '/versicherungen' },
  { name: 'Mobilfunk', href: '/mobilfunk' },
  { name: 'Gratis', href: '/gratis' },
  { name: 'Shopping', href: '/shopping' },
  { name: 'Vergleiche', href: '/vergleiche' },
]

export default function KategorieNavigation() {
  const pathname = usePathname()

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-4 text-sm font-medium text-gray-700">
        {categories.map((cat) => {
          const isActive = pathname.startsWith(cat.href)
          return (
            <Link
              key={cat.href}
              href={cat.href}
              className={
                isActive
                  ? 'text-[#003b5b] border-b-2 border-[#003b5b] pb-1'
                  : 'hover:text-[#003b5b]'
              }
            >
              {cat.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
