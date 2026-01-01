import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

export interface AuthResult {
  authorized: boolean;
  error?: string;
  userId?: string;
}

export async function verifyAdminAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  const cronSecret = req.headers.get('X-Cron-Secret');
  const expectedCronSecret = Deno.env.get('CRON_SECRET');

  if (cronSecret && expectedCronSecret && cronSecret === expectedCronSecret) {
    return { authorized: true };
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      error: 'Missing or invalid authorization header',
    };
  }

  const token = authHeader.replace('Bearer ', '');

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return {
      authorized: false,
      error: 'Invalid or expired token',
    };
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (adminError || !adminUser || !adminUser.is_active) {
    return {
      authorized: false,
      error: 'User is not an active administrator',
    };
  }

  return {
    authorized: true,
    userId: user.id,
  };
}

export function createUnauthorizedResponse(error: string = 'Unauthorized'): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error,
      message: 'This endpoint requires admin authentication',
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Secret',
      },
    }
  );
}
