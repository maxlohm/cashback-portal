// app/api/partner-lead/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServerSupabase() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL; // Fallback, falls du es so gesetzt hast
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    // Wirf KEINEN Fehler beim Import/Build, sondern antworte zur Laufzeit sauber
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRoleKey);
}

export async function POST(req: NextRequest) {
  try {
    // Content-Type tolerant prüfen
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Bad content type" }, { status: 415 });
    }

    const body = await req.json().catch(() => ({}));
    const { api_key, click_id, amount } = body as {
      api_key?: string;
      click_id?: string;
      amount?: number | string | null;
    };

    if (!api_key || !click_id) {
      return NextResponse.json({ error: "Missing api_key or click_id" }, { status: 400 });
    }

    const supabase = getServerSupabase(); // <-- Lazy-Init erst hier

    // Rate limit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const throttleKey = `partner-lead:${ip}:${click_id}`;
    const { data: ok, error: thrErr } = await supabase.rpc("throttle_touch", {
      p_key: throttleKey,
      window_seconds: 5,
    });
    if (thrErr || ok === false) {
      await supabase.from("event_log").insert({
        event_type: "rate_limit_block",
        context: { route: "partner-lead", key: throttleKey, err: thrErr?.message },
      });
      return NextResponse.json({ error: "Rate limit. Try again later." }, { status: 429 });
    }

    // Partner via API-Key
    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .select("id")
      .eq("api_key", api_key)
      .maybeSingle();

    if (!partner || partnerError) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Click check
    const { data: click, error: clickError } = await supabase
      .from("clicks")
      .select("id, influencer_id")
      .eq("id", click_id)
      .maybeSingle();

    if (!click || clickError) {
      return NextResponse.json({ error: "Click not found" }, { status: 404 });
    }
    if (click.influencer_id !== partner.id) {
      return NextResponse.json({ error: "Click does not belong to this partner" }, { status: 403 });
    }

    // Schon Lead vorhanden?
    const { data: existingLead } = await supabase
      .from("leads")
      .select("id")
      .eq("click_id", click_id)
      .maybeSingle();

    if (existingLead) {
      return NextResponse.json({ message: "Lead already exists" }, { status: 200 });
    }

    // Betrag normalisieren
    const normalizedAmount =
      amount === undefined || amount === null || amount === ""
        ? null
        : typeof amount === "string"
        ? Number(amount)
        : amount;

    const { error: insertError } = await supabase.from("leads").insert({
      click_id,
      confirmed: true,
      confirmed_at: new Date().toISOString(),
      amount: normalizedAmount,
      payout_ready: true,
    });

    if (insertError) {
      return NextResponse.json({ error: "Insert failed", detail: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Lead created" }, { status: 201 });
  } catch (e: any) {
    // Wenn ENVs fehlen, klare Meldung statt Build-Absturz
    if (String(e?.message || e).includes("SUPABASE_URL")) {
      return NextResponse.json(
        { error: "Server misconfigured: missing SUPABASE envs" },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Unexpected error", detail: String(e?.message || e) }, { status: 500 });
  }
}
