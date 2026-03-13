import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

function decodeJwtPayload(token: string): { sub?: string; email?: string } {
  const parts = token.replace(/^Bearer\s+/i, "").trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  const payload = parts[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "==".slice(0, (4 - (base64.length % 4)) % 4);
  return JSON.parse(atob(padded)) as { sub?: string; email?: string };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function refreshGoogleToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function gcalRequest(
  accessToken: string,
  method: string,
  path: string,
  body?: object
): Promise<Response> {
  const url = `https://www.googleapis.com/calendar/v3${path}`;
  const init: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };
  if (body && (method === "POST" || method === "PATCH")) {
    init.body = JSON.stringify(body);
  }
  return fetch(url, init);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = decodeJwtPayload(authHeader);
    const userId = payload.sub;
    const userEmail = payload.email?.toLowerCase();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const demoEmail = Deno.env.get("DEMO_USER_EMAIL")?.toLowerCase();
    if (demoEmail && userEmail === demoEmail) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "demo" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({})) as { projectId?: string };
    const projectId = body.projectId;
    if (!projectId || typeof projectId !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing projectId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id, name, start_date, end_date, gcal_event_id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: "Project not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: tokensRow, error: tokensError } = await supabase
      .from("google_tokens")
      .select("access_token, refresh_token, expires_at")
      .eq("user_id", userId)
      .single();

    if (tokensError || !tokensRow) {
      return new Response(
        JSON.stringify({ error: "Google Calendar に連携してください" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken = tokensRow.access_token as string;
    let refreshToken = tokensRow.refresh_token as string;
    let expiresAt = new Date((tokensRow.expires_at as string).replace("Z", ""));

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (expiresAt.getTime() <= Date.now() + 60_000) {
      const refreshed = await refreshGoogleToken(
        refreshToken,
        clientId,
        clientSecret
      );
      accessToken = refreshed.access_token;
      const newExpiresAt = new Date(
        Date.now() + (refreshed.expires_in ?? 3600) * 1000
      ).toISOString();
      await supabase
        .from("google_tokens")
        .update({
          access_token: accessToken,
          expires_at: newExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    }

    const startDate = project.start_date as string | null;
    const endDate = project.end_date as string | null;
    const gcalEventId = project.gcal_event_id as string | null;
    const hasDates = !!(startDate || endDate);

    if (!hasDates) {
      if (gcalEventId) {
        const delRes = await gcalRequest(
          accessToken,
          "DELETE",
          `/calendars/primary/events/${encodeURIComponent(gcalEventId)}`
        );
        if (!delRes.ok && delRes.status !== 404) {
          console.error("GCal delete error:", await delRes.text());
        }
        await supabase
          .from("projects")
          .update({
            gcal_event_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId)
          .eq("user_id", userId);
      }
      return new Response(
        JSON.stringify({ success: true, action: "cleared" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const start = startDate ?? endDate!;
    const end = endDate ? addDays(endDate, 1) : addDays(start, 1);
    const summary = (project.name as string) || "（無題の案件）";

    const eventBody = {
      summary,
      start: { date: start },
      end: { date: end },
    };

    if (gcalEventId) {
      const patchRes = await gcalRequest(
        accessToken,
        "PATCH",
        `/calendars/primary/events/${encodeURIComponent(gcalEventId)}`,
        eventBody
      );
      if (!patchRes.ok) {
        const err = await patchRes.text();
        console.error("GCal patch error:", err);
        return new Response(
          JSON.stringify({ error: "Failed to update calendar event" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: true, action: "updated" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const insertRes = await gcalRequest(
      accessToken,
      "POST",
      "/calendars/primary/events",
      eventBody
    );
    if (!insertRes.ok) {
      const err = await insertRes.text();
      console.error("GCal insert error:", err);
      return new Response(
        JSON.stringify({ error: "Failed to create calendar event" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const created = (await insertRes.json()) as { id?: string };
    const eventId = created.id;
    if (!eventId) {
      return new Response(
        JSON.stringify({ error: "No event id in response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("projects")
      .update({
        gcal_event_id: eventId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({ success: true, action: "created" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
