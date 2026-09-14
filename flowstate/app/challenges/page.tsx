import type { Metadata } from 'next';
import { SiteHeader } from '@/components/nav/site-header';
import { SiteFooter } from '@/components/nav/site-footer';
import { ChallengeBoard } from '@/components/dashboard/challenge-board';

export const metadata: Metadata = {
  title: 'Challenges',
  description: 'A new freestyle challenge every day, scored from your session.',
};

export default function ChallengesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-[clamp(2.25rem,7vw,3.25rem)] font-black leading-[0.95]">
            Challenges
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            One challenge is live each day, the same for everyone. Each is scored from the
            same analysis your session already runs — nothing extra to set up.
          </p>

          <div className="mt-8">
            <ChallengeBoard />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
