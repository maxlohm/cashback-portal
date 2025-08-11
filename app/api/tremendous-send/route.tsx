// app/api/tremendous-send/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getServerSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRoleKey);
}

export async function POST(req: Request) {
  // Content-Type tolerant prüfen
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return NextResponse.json({ error: "Bad content type" }, { status: 415 });
  }

  // Body-Größe limitieren & parsen
  const text = await req.text();
  if (text.length > 10_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { redemption_id } = body;
  if (!redemption_id) {
    return NextResponse.json({ error: "Missing redemption_id" }, { status: 400 });
  }

  // Origin-Check (fallback auf SITE_URL)
  const referer = req.headers.get("referer") || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
  if (siteUrl && !referer.includes(siteUrl)) {
    const supabase = getServerSupabase();
    await supabase.from("event_log").insert({
      event_type: "origin_check_failed",
      context: { redemption_id, referer }
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getServerSupabase();

  // Rate-Limit
  const key = `tremendous-send:${redemption_id}`;
  const { data: ok2, error: thrErr2 } = await supabase.rpc("throttle_touch", {
    p_key: key,
    window_seconds: 60,
  });
  if (thrErr2 || ok2 === false) {
    await supabase.from("event_log").insert({
      event_type: "rate_limit_block",
      context: { route: "tremendous-send", key }
    });
    return NextResponse.json({ error: "Bitte kurz warten …" }, { status: 429 });
  }

  // Redemption-Daten holen
  const { data: redemption, error: redemptionError } = await supabase
    .from("redemptions")
    .select("id, amount, user_email")
    .eq("id", redemption_id)
    .single();

  if (redemptionError || !redemption) {
    return NextResponse.json({ error: "Redemption not found" }, { status: 404 });
  }

  // Log Start
  await supabase.from("event_log").insert({
    event_type: "tremendous_send_started",
    related_id: redemption.id,
    context: { amount: redemption.amount, user_email: redemption.user_email }
  });

  try {
    // Tremendous Call
    if (!process.env.TREMENDOUS_API_KEY || !process.env.TREMENDOUS_FUNDING_SOURCE) {
      throw new Error("Missing Tremendous credentials");
    }

    const res = await fetch("https://api.tremendous.com/v2/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TREMENDOUS_API_KEY}`,
        "Content-Type": "application/json",
    },
      body: JSON.stringify({
        payment: { funding_source_id: process.env.TREMENDOUS_FUNDING_SOURCE },
        reward: {
          value: { denomination: redemption.amount, currency_code: "EUR" },
          recipient: { email: redemption.user_email },
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(errBody || `Tremendous HTTP ${res.status}`);
    }

    await supabase.from("event_log").insert({
      event_type: "tremendous_send_success",
      related_id: redemption.id,
      context: { amount: redemption.amount, user_email: redemption.user_email }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    await supabase.from("event_log").insert({
      event_type: "tremendous_send_failed",
      related_id: redemption.id,
      context: { amount: redemption.amount, user_email: redemption.user_email, error: String(err?.message || err) }
    });
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
