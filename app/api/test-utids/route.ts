// 📁 app/api/test-utids/route.ts

import { NextResponse } from 'next/server'
import { Buffer } from 'buffer'

export async function GET() {
  const credentials = `${process.env.TANGO_USERNAME}:${process.env.TANGO_PASSWORD}`
  const authHeader = 'Basic ' + Buffer.from(credentials).toString('base64')

  const response = await fetch('https://integration-api.tangocard.com/raas/v2/brands', {
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()
  return NextResponse.json(data)
}
