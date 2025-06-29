import { Buffer } from 'buffer'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('❌ Supabase-Umgebungsvariablen sind nicht gesetzt!')
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  const { email, value, utid, user_id } = await req.json()

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
    if (user_id) {
      await supabase.from('gift_cards').insert([
        {
          user_id,
          code,
          type: utid === 'U591998' ? 'Amazon' : 'Unbekannt',
          value,
          issued_at: new Date().toISOString(),
        },
      ])
    }

    return NextResponse.json({ success: true, code, tangoData })
  } else {
    return NextResponse.json({ success: false, error: tangoData }, { status: 400 })
  }
}
