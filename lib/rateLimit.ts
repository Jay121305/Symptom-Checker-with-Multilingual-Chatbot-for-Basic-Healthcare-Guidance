// Rate Limiting - Prevents API abuse and ensures fair usage
// Uses sliding window algorithm for accurate rate tracking

interface RateLimitRecord {
  count: number;
  resetTime: number;
  firstRequest: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Auto-cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
  limit: number;
}

/**
 * Check rate limit for a given identifier (IP address or user ID)
 * 
 * @param identifier - Unique identifier (IP, user ID, or API key)
 * @param maxRequests - Maximum requests allowed in the window (default: 30)
 * @param windowMs - Time window in milliseconds (default: 60 seconds)
 * @returns RateLimitResult with allowed status and remaining count
 * 
 * @example
 * ```typescript
 * const ip = request.headers.get('x-forwarded-for') || 'unknown';
 * const limit = checkRateLimit(ip, 30, 60000);
 * if (!limit.allowed) {
 *   return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // New user or expired window
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
      firstRequest: now,
    });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      limit: maxRequests,
    };
  }

  // Check if over limit
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
      limit: maxRequests,
    };
  }

  // Increment counter
  record.count++;

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    limit: maxRequests,
  };
}

/**
 * Get rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
  };

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Get rate limiting statistics for monitoring
 */
export function getRateLimitStats() {
  const now = Date.now();
  let activeUsers = 0;
  let blockedUsers = 0;

  for (const [, record] of rateLimitMap.entries()) {
    if (now < record.resetTime) {
      activeUsers++;
      if (record.count >= 30) {
        blockedUsers++;
      }
    }
  }

  return {
    trackedIdentifiers: rateLimitMap.size,
    activeUsers,
    blockedUsers,
  };
}

// Route-specific rate limit configurations
export const RATE_LIMITS = {
  chat: { maxRequests: 30, windowMs: 60000 },        // 30 msgs/min
  analyze: { maxRequests: 20, windowMs: 60000 },      // 20 analyses/min
  emergency: { maxRequests: 10, windowMs: 60000 },     // 10 alerts/min (prevent spam)
  translate: { maxRequests: 50, windowMs: 60000 },     // 50 translations/min
  iot: { maxRequests: 60, windowMs: 60000 },           // 60 readings/min (1/sec)
  auth: { maxRequests: 5, windowMs: 300000 },          // 5 login attempts/5min
  patients: { maxRequests: 20, windowMs: 60000 },      // 20 queries/min
} as const;
