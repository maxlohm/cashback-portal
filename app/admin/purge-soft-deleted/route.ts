// app/api/admin/purge-soft-deleted/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getServerSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRoleKey);
}

async function handler(req: Request) {
  const requestId = crypto.randomUUID();
  const json = (data: unknown, status = 200) =>
    NextResponse.json({ request_id: requestId, ...(data as object) }, { status });

  try {
    // 🔐 Secret-Check: Authorization: Bearer <CRON_SECRET> ODER x-cron-secret: <CRON_SECRET>
    const auth = req.headers.get("authorization");
    const xhdr = req.headers.get("x-cron-secret");
    const secret = process.env.CRON_SECRET || "";
    const okSecret = secret && (auth === `Bearer ${secret}` || xhdr === secret);
    if (!okSecret) return json({ error: "Unauthorized" }, 401);

    const supabase = getServerSupabase();

    const DAYS = Number(process.env.PURGE_AFTER_DAYS ?? "30");
    if (!Number.isFinite(DAYS) || DAYS < 0) {
      return json({ error: "Invalid PURGE_AFTER_DAYS" }, 500);
    }
    const cutoff = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();

    // Kandidaten holen
    const { data: users, error: selErr } = await supabase
      .from("profiles")
      .select("id")
      .not("soft_deleted_at", "is", null)
      .lt("soft_deleted_at", cutoff);

    if (selErr) return json({ error: selErr.message }, 500);
    if (!users?.length) return json({ ok: true, deleted: 0, failed: 0 });

    let ok = 0,
      fail = 0;

    for (const u of users) {
      const userId = String((u as any).id);

      const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
      if (delErr) {
        fail++;
        await supabase.from("event_log").insert({
          event_type: "gdpr.hard_delete_failed",
          related_id: userId,
          context: { error: delErr.message, days: DAYS, request_id: requestId },
        });
        continue;
      }

      ok++;
      await supabase.from("event_log").insert({
        event_type: "gdpr.hard_delete_ok",
        related_id: userId,
        context: { days: DAYS, request_id: requestId },
      });

      // Markierung für Audit (optional)
      await supabase
        .from("profiles")
        .update({ delete_reason: "hard_deleted_after_soft_delete" })
        .eq("id", userId);
    }

    return json({ ok: true, deleted: ok, failed: fail });
  } catch (e: any) {
    const msg = String(e?.message || e);
    const isEnv = msg.includes("SUPABASE_URL") || msg.includes("SUPABASE_SERVICE_ROLE_KEY");
    return json(
      { error: isEnv ? "Server misconfigured: missing SUPABASE envs" : "Unexpected error", detail: msg },
      isEnv ? 500 : 500
    );
  }
}

// ✅ Vercel Cron nutzt GET. POST lassen wir zusätzlich zu (manuelles Triggern).
export const GET = handler;
export const POST = handler;
