// app/api/partner-lead/route.ts
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

function parseAmount(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === "") return null;
  const num = typeof raw === "string" ? Number(raw) : (raw as number);
  if (!Number.isFinite(num) || num < 0) {
    throw new Error("Invalid amount");
  }
  return num;
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const json = (data: unknown, status = 200) =>
    NextResponse.json({ request_id: requestId, ...((data as object) || {}) }, { status });

  let supabase;
  try {
    // Content-Type tolerant und Body-Limit
    const ct = req.headers.get("content-type") || "";
    if (!ct.toLowerCase().includes("application/json")) {
      return json({ error: "Bad content type" }, 415);
    }
    const bodyText = await req.text();
    if (bodyText.length > 20_000) {
      return json({ error: "Payload too large" }, 413);
    }

    const body = bodyText ? JSON.parse(bodyText) : {};
    const { api_key, click_id, amount } = body as {
      api_key?: string;
      click_id?: string;
      amount?: number | string | null;
    };

    if (!api_key || !click_id) {
      return json({ error: "Missing api_key or click_id" }, 400);
    }

    const normalizedAmount = parseAmount(amount);

    supabase = getServerSupabase(); // Lazy-Init erst hier

    // Rate limit (pro IP+Click)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const throttleKey = `partner-lead:${ip}:${click_id}`;
    const { data: rlOk, error: rlErr } = await supabase.rpc("throttle_touch", {
      p_key: throttleKey,
      window_seconds: 5,
    });
    if (rlErr || rlOk === false) {
      await supabase.from("event_log").insert({
        event_type: "rate_limit_block",
        context: { route: "partner-lead", key: throttleKey, err: rlErr?.message, request_id: requestId },
      });
      return json({ error: "Rate limit. Try again later." }, 429);
    }

    // Partner via API-Key
    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .select("id")
      .eq("api_key", api_key)
      .maybeSingle();

    if (partnerError || !partner) {
      return json({ error: "Invalid API key" }, 401);
    }

    // Click check
    const { data: click, error: clickError } = await supabase
      .from("clicks")
      .select("id, influencer_id")
      .eq("id", click_id)
      .maybeSingle();

    if (clickError || !click) {
      return json({ error: "Click not found" }, 404);
    }
    if (click.influencer_id !== partner.id) {
      return json({ error: "Click does not belong to this partner" }, 403);
    }

    // Idempotenz: existiert schon ein Lead?
    const { data: existingLead, error: existingErr } = await supabase
      .from("leads")
      .select("id")
      .eq("click_id", click_id)
      .maybeSingle();

    if (existingErr) {
      return json({ error: "Lookup failed", detail: existingErr.message }, 500);
    }
    if (existingLead) {
      return json({ message: "Lead already exists", deduped: true }, 200);
    }

    // Lead anlegen
    const { error: insertError } = await supabase.from("leads").insert({
      click_id,
      confirmed: true,
      confirmed_at: new Date().toISOString(),
      amount: normalizedAmount, // darf null sein (Trigger kann setzen)
      payout_ready: true,
    });

    if (insertError) {
      await supabase.from("event_log").insert({
        event_type: "partner_lead_insert_failed",
        context: { click_id, err: insertError.message, request_id: requestId },
      });
      return json({ error: "Insert failed", detail: insertError.message }, 500);
    }

    await supabase.from("event_log").insert({
      event_type: "partner_lead_created",
      context: { click_id, amount: normalizedAmount, request_id: requestId },
    });

    return json({ message: "Lead created" }, 201);
  } catch (e: any) {
    // Best-effort Logging
    try {
      supabase ||= getServerSupabase();
      await supabase.from("event_log").insert({
        event_type: "partner_lead_error",
        context: { error: String(e?.message || e), request_id: requestId },
      });
    } catch {}
    const msg = String(e?.message || e);
    if (msg.includes("SUPABASE_URL") || msg.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return json({ error: "Server misconfigured: missing SUPABASE envs" }, 500);
    }
    if (msg === "Invalid amount") {
      return json({ error: "Invalid amount" }, 400);
    }
    return json({ error: "Unexpected error", detail: msg }, 500);
  }
}
