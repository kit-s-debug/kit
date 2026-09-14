import { NextResponse } from 'next/server';
import { getAIProvider } from '@/services/ai';
import { parseSuggestBody } from '@/lib/api/validate';
import { clientKey, rateLimit } from '@/lib/api/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Enriches the local suggestions with model-written line ideas.
 *
 * The client never waits on this: it renders local rhymes immediately and
 * merges whatever comes back here if it is still relevant. A failure is a
 * non-event — the response falls back to the local engine's own output.
 */
export async function POST(request: Request) {
  const limited = rateLimit(`suggest:${clientKey(request)}`, 40, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'retry-after': String(limited.retryAfterSec) } },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const body = parseSuggestBody(raw);
  if (!body) {
    return NextResponse.json({ error: 'Invalid suggestion request' }, { status: 400 });
  }

  try {
    const suggestions = await getAIProvider().suggest(body);
    return NextResponse.json(suggestions, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Suggestions are temporarily unavailable' },
      { status: 503 },
    );
  }
}
