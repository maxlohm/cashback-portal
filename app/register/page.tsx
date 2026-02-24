// app/register/page.tsx
import { Suspense } from 'react'
import RegisterClient from './RegisterClient'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Lade…</div>}>
      <RegisterClient />
    </Suspense>
  )
}