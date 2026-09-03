/**
 * Best-effort, in-memory sliding window keyed by IP.
 *
 * On serverless this is per-instance and resets when the instance recycles, so
 * it is a speed bump for casual abuse rather than a guarantee. Combined with
 * the honeypot and the timing check it is proportionate for a form that sends
 * one email and stores nothing. If it ever needs to be strict, put Upstash
 * Ratelimit behind the same function signature — see README.
 */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_IN_WINDOW = 5;

const hits = new Map<string, number[]>();

export function rateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS);

  if (recent.length >= MAX_IN_WINDOW) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    hits.set(key, recent);
    return { ok: false, retryAfter };
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (!times.some((at) => now - at < WINDOW_MS)) hits.delete(k);
    }
  }

  return { ok: true, retryAfter: 0 };
}
