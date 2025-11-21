// app/api/me/export/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('export_my_data');

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Export fehlgeschlagen' },
      { status: 500 },
    );
  }

  const body = JSON.stringify(data ?? {}, null, 2);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bonus-nest-export.json"',
    },
  });
}
