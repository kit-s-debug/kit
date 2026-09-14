import { NextResponse } from 'next/server';
import { getAIProvider } from '@/services/ai';
import { parseAnalyseBody } from '@/lib/api/validate';
import { clientKey, rateLimit } from '@/lib/api/rate-limit';
import type { PerformanceAnalysis } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Turns the measured scores into two or three written observations.
 *
 * The numbers themselves are computed on the client from the transcript and
 * the onset timing — this route only supplies the wording, and the client
 * already has a local fallback if it fails.
 */
export async function POST(request: Request) {
  const limited = rateLimit(`analyze:${clientKey(request)}`, 12, 60_000);
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

  const body = parseAnalyseBody(raw);
  if (!body) {
    return NextResponse.json({ error: 'Not enough transcript to analyse' }, { status: 400 });
  }

  const base: PerformanceAnalysis = {
    overall: 0,
    breakdown: body.breakdown,
    strongestMoment: null,
    highlights: [],
    observations: [],
    stats: {
      wordCount: body.transcript.split(/\s+/).length,
      uniqueWords: new Set(body.transcript.toLowerCase().split(/\s+/)).size,
      bars: 0,
      wordsPerMinute: 0,
      avgSyllablesPerBar: 0,
      longestRhymeChain: body.longestRhymeChain,
      silenceRatio: 0,
    },
    aiEnriched: false,
  };

  try {
    const provider = getAIProvider();
    const enrichment = await provider.analyse({
      bars: [],
      transcript: body.transcript,
      bpm: body.bpm,
      durationSec: body.durationSec,
      difficulty: body.difficulty,
      base,
    });
    return NextResponse.json(
      { ...enrichment, aiEnriched: provider.live },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'Analysis is temporarily unavailable' }, { status: 503 });
  }
}
