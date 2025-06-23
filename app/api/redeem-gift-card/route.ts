// 📁 app/api/redeem-gift-card/route.ts

import { Buffer } from 'buffer'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, value, utid } = await req.json()

  const body = {
    accountIdentifier: process.env.TANGO_ACCOUNT_IDENTIFIER || '',
    customerIdentifier: process.env.TANGO_CUSTOMER_IDENTIFIER || '',
    recipient: {
      email: email || 'test@example.com',
      firstName: 'Hydro',
      lastName: 'Cash',
    },
    utid: utid || 'U591998',
    amount: value || 5,
    sendEmail: false,
  }

  const credentials = `${process.env.TANGO_USERNAME}:${process.env.TANGO_PASSWORD}`
  const authHeader = 'Basic ' + Buffer.from(credentials).toString('base64')

  const tangoRes = await fetch('https://integration-api.tangocard.com/raas/v2/orders', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const tangoData = await tangoRes.json()
  const code = tangoData?.reward?.redemptionInstructions || 'NO_CODE_RECEIVED'

  if (tangoRes.ok) {
    return NextResponse.json({ success: true, code, tangoData })
  } else {
    return NextResponse.json({ success: false, error: tangoData }, { status: 400 })
  }
}
