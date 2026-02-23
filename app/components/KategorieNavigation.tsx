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
    <nav className="relative z-20">
      {/* Floating: zieht die Navigation über den Banner-Rand */}
      <div className="-mt-7 sm:-mt-9">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mx-auto w-fit max-w-full">
            {/* Glas-Container */}
            <div
              className={[
                'rounded-2xl px-2 py-2',
                'bg-white/55 backdrop-blur-xl',
                'border border-white/50',
                'shadow-[0_18px_45px_rgba(0,0,0,0.14)]',
              ].join(' ')}
            >
              {/* Mobile horizontal scroll */}
              <div className="max-w-[92vw] overflow-x-auto">
                <div className="flex justify-center gap-2 min-w-max">
                  {categories.map((cat) => {
                    const isActive =
                      cat.href === '/'
                        ? pathname === '/'
                        : pathname.startsWith(cat.href)

                    return (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        className={[
                          'shrink-0 whitespace-nowrap',
                          'px-4 py-2 rounded-xl text-sm font-semibold',
                          'transition-all duration-200',
                          isActive
                            ? [
                                'bg-slate-900 text-white',
                                'shadow-[0_10px_22px_rgba(0,0,0,0.22)]',
                              ].join(' ')
                            : [
                                'text-slate-700',
                                'bg-white/50',
                                'border border-black/5',
                                'hover:bg-white/75 hover:shadow-sm',
                              ].join(' '),
                        ].join(' ')}
                      >
                        {cat.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Optional: kleiner Abstand nach unten */}
            <div className="h-4" />
          </div>
        </div>
      </div>
    </nav>
  )
}