interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  admin_action: { maxRequests: 10, windowMs: 60000 },
  ai_generation: { maxRequests: 3, windowMs: 60000 },
  sync_trigger: { maxRequests: 1, windowMs: 60000 },
  default: { maxRequests: 20, windowMs: 60000 },
};

function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredEntries, 60000);

function getIdentifier(req: Request, userId?: string): string {
  const ip = req.headers.get('x-forwarded-for') ||
             req.headers.get('x-real-ip') ||
             'unknown';

  return userId ? `user:${userId}` : `ip:${ip}`;
}

export function checkRateLimit(
  req: Request,
  limitType: keyof typeof RATE_LIMIT_CONFIGS = 'default',
  userId?: string
): { allowed: boolean; retryAfter?: number } {
  const identifier = getIdentifier(req, userId);
  const key = `${limitType}:${identifier}`;
  const config = RATE_LIMIT_CONFIGS[limitType] || RATE_LIMIT_CONFIGS.default;

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { allowed: true };
  }

  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  rateLimitStore.set(key, entry);
  return { allowed: true };
}

export function createRateLimitResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Too many requests',
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': (Date.now() + retryAfter * 1000).toString(),
      },
    }
  );
}

export function getRateLimitHeaders(
  limitType: keyof typeof RATE_LIMIT_CONFIGS = 'default'
): Record<string, string> {
  const config = RATE_LIMIT_CONFIGS[limitType] || RATE_LIMIT_CONFIGS.default;

  return {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Window': (config.windowMs / 1000).toString(),
  };
}
