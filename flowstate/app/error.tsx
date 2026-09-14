'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/nav/wordmark';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the console so a problem is never silent during development.
    console.error('FLOWSTATE error boundary:', error);
  }, [error]);

  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Wordmark className="justify-center" />
        <h1 className="mt-8 font-display text-[clamp(2rem,8vw,2.75rem)] font-black leading-tight">
          Something dropped out
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          An unexpected error stopped that page loading. Your saved sessions are untouched.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-accent px-6 text-sm font-bold text-[#180700] transition-colors hover:bg-accent-soft"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-line px-6 text-sm font-semibold text-muted transition-colors hover:text-text"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
