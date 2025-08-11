// app/api/tremendous-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";          // Service-Role niemals im Edge
export const dynamic = "force-dynamic";   // verhindert Vorab-Auswertung beim Build

function getServerSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRoleKey);
}

export async function POST(req: NextRequest) {
  let supabase;
  try {
    // Content-Type tolerant prüfen (z. B. "application/json; charset=utf-8")
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Bad content type" }, { status: 415 });
    }

    // Optional: Secret-Header prüfen
    const secret = req.headers.get("x-webhook-secret");
    if (process.env.TREMENDOUS_WEBHOOK_SECRET && secret !== process.env.TREMENDOUS_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const redemptionId: string | undefined = payload?.external_id;
    const statusRaw: string | undefined = payload?.status;
    const status = String(statusRaw || "").toLowerCase();

    supabase = getServerSupabase(); // <-- Lazy-Init erst hier

    // Rohes Event loggen
    await supabase.from("event_log").insert({
      event_type: "tremendous_webhook_received",
      related_id: redemptionId,
      context: payload,
    });

    if (!redemptionId || !status) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Wenn geliefert/ausgezahlt -> paid
    if (status === "delivered") {
      const { error } = await supabase
        .from("redemptions")
        .update({ status: "paid" })
        .eq("id", redemptionId);

      if (error) {
        await supabase.from("event_log").insert({
          event_type: "tremendous_update_failed",
          related_id: redemptionId,
          context: { error: error.message },
        });
        return NextResponse.json({ error: "Failed to update redemption" }, { status: 500 });
      }

      await supabase.from("event_log").insert({
        event_type: "tremendous_marked_paid",
        related_id: redemptionId,
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    // Best effort logging, falls Supabase verfügbar ist
    try {
      if (!supabase) supabase = getServerSupabase();
      await supabase.from("event_log").insert({
        event_type: "tremendous_webhook_error",
        context: { error: String(err?.message || err) },
      });
    } catch {}
    const msg = String(err?.message || err);
    const configErr = msg.includes("SUPABASE_URL") || msg.includes("SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json(
      { error: configErr ? "Server misconfigured: missing SUPABASE envs" : "Invalid request", detail: msg },
      { status: configErr ? 500 : 400 }
    );
  }
}
