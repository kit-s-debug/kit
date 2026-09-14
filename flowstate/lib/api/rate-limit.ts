/**
 * A small fixed-window limiter.
 *
 * In-process only, which is right for a single-instance MVP and honest about
 * its limits: behind several instances this becomes per-instance. Swap for a
 * shared store when there is one.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
const MAX_TRACKED = 5000;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size > MAX_TRACKED) windows.clear();
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { ok: true, remaining: limit - existing.count, retryAfterSec: 0 };
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local';
  return ip.slice(0, 64);
}
