import { Buffer } from 'buffer'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST-Handler für Gutscheinbestellung
export async function POST(req: NextRequest) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, TANGO_USERNAME, TANGO_PASSWORD, TANGO_ACCOUNT_IDENTIFIER, TANGO_CUSTOMER_IDENTIFIER } = process.env

  // Validierung der .env-Variablen
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !TANGO_USERNAME || !TANGO_PASSWORD || !TANGO_ACCOUNT_IDENTIFIER || !TANGO_CUSTOMER_IDENTIFIER) {
    return NextResponse.json({ error: '❌ Environment variables missing.' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Nutzer-Request extrahieren
  let email: string = ''
  let value: number = 5
  let utid: string = 'U591998'
  let user_id: string | undefined

  try {
    const json = await req.json()
    email = json.email || 'test@example.com'
    value = json.value || 5
    utid = json.utid || 'U591998'
    user_id = json.user_id
  } catch (err) {
    return NextResponse.json({ error: '❌ Ungültiger JSON-Body' }, { status: 400 })
  }

  // Tango-Request vorbereiten
  const body = {
    accountIdentifier: TANGO_ACCOUNT_IDENTIFIER,
    customerIdentifier: TANGO_CUSTOMER_IDENTIFIER,
    recipient: {
      email,
      firstName: 'Hydro',
      lastName: 'Cash',
    },
    utid,
    amount: value,
    sendEmail: false,
  }

  const authHeader = 'Basic ' + Buffer.from(`${TANGO_USERNAME}:${TANGO_PASSWORD}`).toString('base64')

  // Anfrage an Tango Card API
  let tangoData: any = null
  try {
    const tangoRes = await fetch('https://integration-api.tangocard.com/raas/v2/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    tangoData = await tangoRes.json()

    if (!tangoRes.ok) {
      return NextResponse.json({ success: false, error: tangoData }, { status: 400 })
    }

    const code = tangoData?.reward?.redemptionInstructions || 'NO_CODE_RECEIVED'

    // In Supabase speichern
    if (user_id) {
      const { error } = await supabase.from('gift_cards').insert([
        {
          user_id,
          code,
          type: utid === 'U591998' ? 'Amazon' : 'Unbekannt',
          value,
          issued_at: new Date().toISOString(),
        },
      ])
      if (error) {
        return NextResponse.json({ success: false, error: '❌ Supabase-Eintrag fehlgeschlagen', supabaseError: error }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, code, tangoData })

  } catch (err: any) {
    return NextResponse.json({ success: false, error: '❌ Fehler beim Gutscheinabruf', message: err?.message }, { status: 500 })
  }
}
