/**
 * Basic CORS helper for Supabase Edge Functions (Deno).
 * Configure allowed origins via env var: CORS_ALLOWLIST (comma-separated)
 * Example: "http://localhost:5173,https://firestargamingnetwork.com"
 */

const defaultAllowlist = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "https://firestargamingnetwork.com",
];

function getAllowlist(): string[] {
  const raw = Deno.env.get("CORS_ALLOWLIST")?.trim();
  if (!raw) return defaultAllowlist;
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}

export function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  const allowlist = getAllowlist();

  const isAllowed = allowlist.includes(origin);
  const allowOrigin = isAllowed ? origin : allowlist[0];

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers":
      "authorization, x-client-info, apikey, content-type, x-cron-secret, x-request-id",
    "access-control-allow-credentials": "true",
    "vary": "Origin",
  };
}

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }
  return null;
}
