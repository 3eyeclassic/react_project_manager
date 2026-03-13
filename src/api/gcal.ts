import { supabase } from "@/lib/supabase";

const GOOGLE_OAUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const SCOPE = "https://www.googleapis.com/auth/calendar";

/**
 * Build the Google OAuth URL for Calendar. Redirect_uri must match the one configured in Google Cloud Console.
 */
export function getGoogleCalendarAuthUrl(redirectUri: string): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("VITE_GOOGLE_CLIENT_ID is not set");
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
  });
  return `${GOOGLE_OAUTH_BASE}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens and store them via Edge Function.
 * redirectUri must match the URI used in the OAuth redirect (e.g. origin + /integrations/google/callback).
 */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<void> {
  const { data, error } = await supabase.functions.invoke("exchange-google-code", {
    body: { code, redirect_uri: redirectUri },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error as string);
}

/**
 * Sync project to Google Calendar (create or update event). Skips in demo mode on the server.
 */
export async function syncProjectToGCal(projectId: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("ログインが必要です");
  }
  const { data, error } = await supabase.functions.invoke("sync-project-gcal", {
    body: { projectId },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error as string);
}

/**
 * Remove stored Google tokens (disconnect). Uses RLS so user can only delete their own row.
 */
export async function disconnectGoogleCalendar(userId: string): Promise<void> {
  const { error } = await supabase
    .from("google_tokens")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}

/**
 * Check if the current user has Google Calendar connected (has a row in google_tokens).
 */
export async function isGoogleCalendarConnected(): Promise<boolean> {
  const { data } = await supabase
    .from("google_tokens")
    .select("user_id")
    .maybeSingle();
  return data != null;
}
