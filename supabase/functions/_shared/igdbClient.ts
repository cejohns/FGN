/**
 * IGDB client helper for Supabase Edge Functions (Deno).
 * Requires secrets:
 *  - IGDB_CLIENT_ID
 *  - IGDB_CLIENT_SECRET
 * Optionally:
 *  - TWITCH_TOKEN_URL (defaults to Twitch OAuth token endpoint)
 */

type TokenCache = { token: string; expiresAt: number } | null;
let cache: TokenCache = null;

function nowMs() {
  return Date.now();
}

function tokenUrl() {
  return Deno.env.get("TWITCH_TOKEN_URL") ?? "https://id.twitch.tv/oauth2/token";
}

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get("IGDB_CLIENT_ID");
  const clientSecret = Deno.env.get("IGDB_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("Missing IGDB_CLIENT_ID / IGDB_CLIENT_SECRET secrets.");
  }

  // Reuse token if valid with a 60s safety buffer
  if (cache && cache.expiresAt - nowMs() > 60_000) return cache.token;

  const url = new URL(tokenUrl());
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("client_secret", clientSecret);
  url.searchParams.set("grant_type", "client_credentials");

  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get Twitch token: ${res.status} ${text}`);
  }

  const json = await res.json() as { access_token: string; expires_in: number };
  cache = { token: json.access_token, expiresAt: nowMs() + (json.expires_in * 1000) };
  return cache.token;
}

export async function igdbRequest<T = unknown>(endpointPath: string, body: string): Promise<T> {
  const clientId = Deno.env.get("IGDB_CLIENT_ID");
  if (!clientId) throw new Error("Missing IGDB_CLIENT_ID secret.");

  const token = await getAccessToken();
  const url = endpointPath.startsWith("http")
    ? endpointPath
    : `https://api.igdb.com/v4/${endpointPath.replace(/^\//, "")}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IGDB request failed: ${res.status} ${text}`);
  }

  return await res.json() as T;
}
