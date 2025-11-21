// app/api/me/delete/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // DSGVO-Softdelete in der DB
  const { error: rpcError } = await supabase.rpc('gdpr_soft_delete_user', {
    p_user: user.id,
    p_reason: 'user_self_delete',
  });

  if (rpcError) {
    console.error(rpcError);
    return NextResponse.json(
      { error: 'Löschung fehlgeschlagen' },
      { status: 500 },
    );
  }

  // Session beenden
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
