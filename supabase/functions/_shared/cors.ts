const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://firestargamingnetwork.com',
];

export function getAllowedOrigins(): string[] {
  const envOrigins = Deno.env.get('ALLOWED_ORIGINS');
  if (envOrigins) {
    return envOrigins.split(',').map(o => o.trim()).filter(Boolean);
  }
  return DEFAULT_ALLOWED_ORIGINS;
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = getAllowedOrigins();
  return allowed.includes(origin);
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && isOriginAllowed(origin) ? origin : 'null';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Secret',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCorsPrelight(req: Request): Response | null {
  if (req.method !== 'OPTIONS') {
    return null;
  }

  const origin = req.headers.get('Origin');

  if (!isOriginAllowed(origin)) {
    return new Response('Origin not allowed', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export function createCorsResponse(
  body: string | object,
  req: Request,
  options: {
    status?: number;
    headers?: Record<string, string>;
  } = {}
): Response {
  const origin = req.headers.get('Origin');

  if (origin && !isOriginAllowed(origin)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Origin not allowed',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  const responseBody = typeof body === 'string' ? body : JSON.stringify(body);
  const corsHeaders = getCorsHeaders(origin);

  return new Response(responseBody, {
    status: options.status || 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...options.headers,
    },
  });
}
