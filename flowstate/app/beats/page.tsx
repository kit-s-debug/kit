import type { Metadata } from 'next';
import { SiteHeader } from '@/components/nav/site-header';
import { SiteFooter } from '@/components/nav/site-footer';
import { BeatBrowser } from '@/components/beat-player/beat-browser';

export const metadata: Metadata = {
  title: 'Beats',
  description:
    'Ten royalty-free beats across boom bap, trap, drill, chill, freestyle and old school — generated in your browser.',
};

export default function BeatsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-[clamp(2.25rem,7vw,3.25rem)] font-black leading-[0.95]">
            Beats
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            Every beat is generated in your browser from a step-sequenced pattern, so
            there is nothing to download and no sample clearance to worry about. The
            tempo is exact, which is what lets your bars be scored against the grid.
          </p>

          <div className="mt-8">
            <BeatBrowser />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
