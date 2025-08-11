// app/api/partner-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return NextResponse.json({ error: "Bad content type" }, { status: 415 });
  }

  const authHeader = req.headers.get("authorization") || "";
  const partnerSecret = process.env.PARTNER_SECRET_KEY || "";
  if (!partnerSecret || authHeader !== `Bearer ${partnerSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Body lesen (mit kleinem Limit)
  const text = await req.text();
  if (text.length > 20_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let payload: any = {};
  try {
    payload = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Erwartete Felder
  const { user_id, offer_id, amount, click_id } = payload as {
    user_id?: string;
    offer_id?: string;
    amount?: number | string;
    click_id?: string; // optional, falls der Partner das mitschickt
  };

  const numericAmount =
    amount === undefined || amount === null || amount === ""
      ? null
      : typeof amount === "string"
      ? Number(amount)
      : amount;

  if (!offer_id || !user_id) {
    return NextResponse.json({ error: "Missing user_id or offer_id" }, { status: 400 });
  }
  if (numericAmount !== null && (!Number.isFinite(numericAmount) || numericAmount <= 0)) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const supabase = getServerSupabase();

  // Event: Eingehendes Webhook-Event loggen
  await supabase.from("event_log").insert({
    event_type: "partner_webhook_received",
    context: { user_id, offer_id, amount: numericAmount, click_id },
  });

  try {
    // 1) passender Click: bevorzugt über click_id; sonst jüngster Click des Users für das Offer
    let click: { id: string } | null = null;

    if (click_id) {
      const { data, error } = await supabase
        .from("clicks")
        .select("id")
        .eq("id", click_id)
        .maybeSingle();
      if (error) throw error;
      click = data;
    } else {
      const { data, error } = await supabase
        .from("clicks")
        .select("id")
        .eq("user_id", user_id)
        .eq("offer_id", offer_id)
        .order("clicked_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      click = data;
    }

    if (!click) {
      return NextResponse.json({ error: "Click not found" }, { status: 404 });
    }

    // 2) Idempotency: existiert schon ein Lead zu diesem Click?
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("click_id", click.id)
      .maybeSingle();

    if (existing) {
      // schon bestätigt → OK
      await supabase.from("event_log").insert({
        event_type: "partner_webhook_duplicate",
        related_id: existing.id,
        context: { click_id: click.id },
      });
      return NextResponse.json({ success: true, deduped: true }, { status: 200 });
    }

    // 3) Lead anlegen (confirmed + payout_ready)
    const { error: insertError } = await supabase.from("leads").insert({
      click_id: click.id,
      confirmed: true,
      confirmed_at: new Date().toISOString(),
      amount: numericAmount, // darf null sein → Trigger kann Betrag berechnen
      payout_ready: true,
    });

    if (insertError) {
      await supabase.from("event_log").insert({
        event_type: "partner_webhook_insert_failed",
        context: { click_id: click.id, error: insertError.message },
      });
      return NextResponse.json(
        { error: "Insert failed", detail: insertError.message },
        { status: 500 }
      );
    }

    await supabase.from("event_log").insert({
      event_type: "partner_webhook_lead_created",
      context: { click_id: click.id, amount: numericAmount },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e: any) {
    await supabase.from("event_log").insert({
      event_type: "partner_webhook_error",
      context: { error: String(e?.message || e) },
    });
    return NextResponse.json(
      { error: "Unexpected error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
