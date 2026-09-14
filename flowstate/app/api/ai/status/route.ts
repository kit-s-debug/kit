import { NextResponse } from 'next/server';
import { getAIProvider } from '@/services/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Reports which provider is answering, so the interface can say so plainly.
 * Returns no key material and no configuration beyond the provider's name.
 */
export async function GET() {
  const status = getAIProvider().status();
  return NextResponse.json(status, {
    headers: { 'cache-control': 'no-store' },
  });
}
