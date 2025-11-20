import { NextRequest, NextResponse } from 'next/server';
import { cookies as nextCookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies: nextCookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'no_user' }, { status: 401 });
  }

  const { data: balance, error } = await supabase.rpc('get_user_balance');

  return NextResponse.json(
    {
      user_id: user.id,
      balance,
      error: error?.message ?? null,
    },
    { status: 200 }
  );
}
