import { getCorsHeaders } from './cors.ts';

export interface CronAuthResult {
  authorized: boolean;
  error?: string;
}

export function verifyCronSecret(req: Request): CronAuthResult {
  const cronSecret = req.headers.get('X-Cron-Secret');
  const expectedCronSecret = Deno.env.get('CRON_SECRET');

  if (!expectedCronSecret) {
    return {
      authorized: false,
      error: 'CRON_SECRET is not configured on the server. Please set the CRON_SECRET environment variable in your Supabase project settings.',
    };
  }

  if (!cronSecret) {
    return {
      authorized: false,
      error: 'Missing X-Cron-Secret header. This endpoint requires a valid cron secret.',
    };
  }

  if (cronSecret !== expectedCronSecret) {
    return {
      authorized: false,
      error: 'Invalid X-Cron-Secret. The provided secret does not match.',
    };
  }

  return {
    authorized: true,
  };
}

export function createCronUnauthorizedResponse(
  req: Request,
  error: string = 'Unauthorized'
): Response {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  return new Response(
    JSON.stringify({
      success: false,
      error,
      message: 'This endpoint requires a valid cron secret via X-Cron-Secret header',
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}
