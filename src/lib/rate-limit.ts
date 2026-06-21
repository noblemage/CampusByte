import { Redis } from '@upstash/redis';
import { Ratelimit, type Duration } from '@upstash/ratelimit';

// Cache for dynamic limiters so we only create each config once per cold start
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const windowSecs = Math.max(1, Math.floor(windowMs / 1000));
  const id = `${limit}-${windowSecs}s`;

  if (!limiters.has(id)) {
    const window: Duration = `${windowSecs} s`;
    const limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, window),
      analytics: false,
    });
    limiters.set(id, limiter);
  }

  return limiters.get(id)!;
}

/**
 * High-performance Redis-backed rate limiter using Upstash.
 * Replaces the legacy PostgreSQL/Prisma implementation.
 *
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; limit: number; remaining: number; resetAt: number }> {
  try {
    const ratelimit = getLimiter(limit, windowMs);
    const result = await ratelimit.limit(key);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  } catch (error) {
    // If the database is unreachable, fail open (allow the request)
    // but log the error. This prevents locking out all users during an Upstash outage.
    console.error('Upstash rate limit check failed:', error);
    return { success: true, limit, remaining: limit, resetAt: Date.now() + windowMs };
  }
}

export function getIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
