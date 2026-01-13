import { createClient } from '@supabase/supabase-js';

import { getCorsHeaders } from './cors.ts';

export interface AuthResult {
  authorized: boolean;
  error?: string;
  userId?: string;
  userEmail?: string;
}

export async function verifyAdminAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const cronSecret = req.headers.get('X-Cron-Secret');
  const expectedCronSecret = Deno.env.get('CRON_SECRET');

  // ✅ Cron bypass (server-to-server)
  if (cronSecret && expectedCronSecret && cronSecret === expectedCronSecret) {
    return { authorized: true };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing or invalid authorization header' };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  // ✅ IMPORTANT: pass Authorization header so getUser works
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, error: 'Invalid or expired token' };
  }

  // ✅ Your screenshot shows admin_users has column "id" (uuid)
  // Most common setup: admin_users.id == auth.users.id
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('is_active, email')
    .eq('id', user.id)
    .maybeSingle();

  if (adminError || !adminUser) {
    return { authorized: false, error: 'User is not an administrator' };
  }

  if (!adminUser.is_active) {
    return { authorized: false, error: 'User is not an active administrator' };
  }

  return {
    authorized: true,
    userId: user.id,
    userEmail: adminUser.email || user.email || undefined,
  };
}

export function createUnauthorizedResponse(
  req: Request,
  error: string = 'Unauthorized'
): Response {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  return new Response(
    JSON.stringify({
      ok: false,
      error,
      message: 'This endpoint requires admin authentication',
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
