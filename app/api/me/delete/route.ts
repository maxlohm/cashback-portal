// app/api/me/delete/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const json = (data: unknown, status = 200) =>
    NextResponse.json({ request_id: requestId, ...(data as object) }, { status });

  // Content-Type + Body-Limit prüfen
  const ct = req.headers.get("content-type") || "";
  if (!ct.toLowerCase().includes("application/json")) {
    return json({ error: "Bad content type" }, 415);
  }
  const bodyText = await req.text();
  if (bodyText.length > 20_000) {
    return json({ error: "Payload too large" }, 413);
  }

  // Supabase-Client erst hier erstellen (kein Top-Level)
  const supabase = createRouteHandlerClient({ cookies });

  // Auth check
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) {
    // Optional: in event_log schreiben
    // await supabase.from("event_log").insert({ event_type: "gdpr_get_user_error", context: { err: userErr.message, requestId } });
    return json({ error: "Auth lookup failed" }, 500);
  }
  if (!user) {
    return json({ error: "Unauthorized" }, 401);
  }

  // Body parsen (defensiv)
  let reason: string | null = null;
  try {
    const parsed = bodyText ? JSON.parse(bodyText) : {};
    reason = (parsed?.reason ?? null) as string | null;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  // GDPR Soft-Delete via RPC
  const { error } = await supabase.rpc("gdpr_soft_delete_user", {
    p_user: user.id,
    p_reason: reason,
  });
  if (error) {
    // Optional: Log
    // await supabase.from("event_log").insert({ event_type: "gdpr_soft_delete_failed", context: { err: error.message, requestId, user_id: user.id } });
    return json({ error: error.message }, 500);
  }

  // Session beenden
  const { error: signOutErr } = await supabase.auth.signOut();
  if (signOutErr) {
    // Optional: Log
    // await supabase.from("event_log").insert({ event_type: "gdpr_signout_failed", context: { err: signOutErr.message, requestId, user_id: user.id } });
    // Trotzdem 200 zurückgeben – Löschung war erfolgreich
  }

  return json({ ok: true }, 200);
}
