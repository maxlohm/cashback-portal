// app/api/admin/purge-soft-deleted/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function handler(req: Request) {
  // 🔐 Secret-Check: akzeptiere entweder
  // - Authorization: Bearer <CRON_SECRET>  (empfohlen für vercel.json crons)
  // - x-cron-secret: <CRON_SECRET>        (falls du per Tool manuell triggerst)
  const auth = req.headers.get("authorization");
  const xhdr = req.headers.get("x-cron-secret");
  const okSecret =
    !!process.env.CRON_SECRET &&
    (auth === `Bearer ${process.env.CRON_SECRET}` || xhdr === process.env.CRON_SECRET);

  if (!okSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role (server only)
  );

  const DAYS = Number(process.env.PURGE_AFTER_DAYS ?? "30");
  const cutoff = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Kandidaten holen
  const { data: users, error: selErr } = await supabase
    .from("profiles")
    .select("id")
    .not("soft_deleted_at", "is", null)
    .lt("soft_deleted_at", cutoff);

  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });
  if (!users?.length) return NextResponse.json({ ok: true, deleted: 0 });

  let ok = 0, fail = 0;

  for (const u of users) {
    const userId = u.id as string;

    const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
    if (delErr) {
      fail++;
      await supabase.from("event_log").insert({
        event_type: "gdpr.hard_delete_failed",
        related_id: userId,
        context: { error: delErr.message, days: DAYS }
      });
      continue;
    }

    ok++;
    await supabase.from("event_log").insert({
      event_type: "gdpr.hard_delete_ok",
      related_id: userId,
      context: { days: DAYS }
    });

    await supabase.from("profiles")
      .update({ delete_reason: "hard_deleted_after_soft_delete" })
      .eq("id", userId);
  }

  return NextResponse.json({ ok: true, deleted: ok, failed: fail });
}

// ✅ Vercel Cron nutzt GET. POST lassen wir zusätzlich zu (manuelles Triggern).
export const GET = handler;
export const POST = handler;
