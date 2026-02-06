/**
 * Simple cron protection.
 * Set CRON_SECRET in Supabase secrets.
 * Accepts either:
 *  - header: x-cron-secret: <secret>
 *  - header: authorization: Bearer <secret>
 */

export function assertCronAuth(req: Request): void {
  const expected = Deno.env.get("CRON_SECRET");
  if (!expected) {
    throw new Error("Missing CRON_SECRET env var (set via supabase secrets).");
  }

  const xCron = req.headers.get("x-cron-secret") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";

  if (xCron !== expected && bearer !== expected) {
    throw new Error("Unauthorized: invalid cron secret.");
  }
}
