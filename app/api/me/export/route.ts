import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export async function GET() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user }, error: aerr } = await supabase.auth.getUser()
  if (aerr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.rpc('export_my_data')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="my-data.json"',
    },
  })
}
