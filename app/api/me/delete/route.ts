// app/api/me/delete/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reason } = await req.json().catch(() => ({ reason: null }));

  const { error } = await supabase.rpc("gdpr_soft_delete_user", {
    p_user: user.id,
    p_reason: reason
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ausloggen
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
