// app/api/catalogs/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

export async function GET() {
  const username = process.env.TANGO_USERNAME || 'QAPlatform2'
  const password = process.env.TANGO_PASSWORD || 'apYPfT6HNONpDRUj3CLGWYt7gvIHONpDRUYPfT6Hj'
  const base64 = Buffer.from(`${username}:${password}`).toString('base64')

  try {
    const res = await fetch('https://integration-api.tangocard.com/raas/v2/choiceProducts', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${base64}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'Tango API-Fehler', detail: text }, { status: res.status })
    }

    const data = await res.json()
    const products = data.choiceProducts || []

    const mapped = products.map((item: any) => ({
      brandName: item.rewardName,
      sku: item.utid,
      image: item.imageUrl || '/logo.png',
      minValue: item.minValue || 500,
    }))

    return NextResponse.json({ choiceProducts: mapped })
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der Gutscheine:', error)
    return NextResponse.json({ error: 'Serverfehler', detail: String(error) }, { status: 500 })
  }
}