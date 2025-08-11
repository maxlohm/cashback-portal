// app/api/me/export/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = crypto.randomUUID();
  const json = (data: unknown, status = 200) =>
    NextResponse.json({ request_id: requestId, ...(data as object) }, { status });

  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) return json({ error: "Auth lookup failed", detail: userErr.message }, 500);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const { data, error } = await supabase.rpc("export_my_data");

  if (error) return json({ error: "Export failed", detail: error.message }, 500);

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="export-${user.id}.json"`,
      "X-Request-ID": requestId,
    },
  });
}
