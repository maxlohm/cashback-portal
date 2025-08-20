// components/OffersGrid.tsx
'use client'

import React from 'react'

export default function OffersGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  )
}
