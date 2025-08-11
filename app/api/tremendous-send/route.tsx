// /app/api/tremendous-send/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // === 0. Content-Type prüfen ===
  if (req.headers.get("content-type") !== "application/json") {
    return NextResponse.json({ error: "Bad content type" }, { status: 415 });
  }

  // === 1. Body-Größe limitieren & parsen ===
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

  // === 2. Origin-Check (nur Admin-Oberfläche erlaubt) ===
  const referer = req.headers.get("referer") || "";
  if (!referer.includes(process.env.NEXT_PUBLIC_SITE_URL!)) {
    await supabase.from("event_log").insert({
      event_type: "origin_check_failed",
      context: { redemption_id, referer }
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // === 3. Rate-Limit (1 Hit / 60s pro redemption_id) ===
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

  // === 4. Redemption-Daten holen ===
  const { data: redemption, error: redemptionError } = await supabase
    .from("redemptions")
    .select("id, amount, user_email")
    .eq("id", redemption_id)
    .single();

  if (redemptionError || !redemption) {
    return NextResponse.json({ error: "Redemption not found" }, { status: 404 });
  }

  // === 5. Log Start ===
  await supabase.from("event_log").insert({
    event_type: "tremendous_send_started",
    related_id: redemption.id,
    context: {
      amount: redemption.amount,
      user_email: redemption.user_email
    }
  });

  try {
    // === 6. Tremendous API Call ===
    const tremendousRes = await fetch("https://api.tremendous.com/v2/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.TREMENDOUS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment: { funding_source_id: process.env.TREMENDOUS_FUNDING_SOURCE },
        reward: {
          value: { denomination: redemption.amount, currency_code: "EUR" },
          recipient: { email: redemption.user_email },
        }
      }),
    });

    if (!tremendousRes.ok) {
      const errorData = await tremendousRes.json();
      throw new Error(JSON.stringify(errorData));
    }

    // === 7. Log Erfolg ===
    await supabase.from("event_log").insert({
      event_type: "tremendous_send_success",
      related_id: redemption.id,
      context: {
        amount: redemption.amount,
        user_email: redemption.user_email
      }
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    // === 8. Log Fehler ===
    await supabase.from("event_log").insert({
      event_type: "tremendous_send_failed",
      related_id: redemption.id,
      context: {
        amount: redemption.amount,
        user_email: redemption.user_email,
        error: err.message
      }
    });

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
