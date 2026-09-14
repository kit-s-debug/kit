import Link from 'next/link';
import { Wordmark } from '@/components/nav/wordmark';

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Wordmark className="justify-center" />
        <h1 className="mt-8 font-display text-[clamp(3rem,14vw,5rem)] font-black leading-none">
          404
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          That page does not exist. The beat is still running though.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/freestyle"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-accent px-6 text-sm font-bold text-[#180700] transition-colors hover:bg-accent-soft"
          >
            Start freestyling
          </Link>
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
