import type { Metadata } from 'next';
import { SiteHeader } from '@/components/nav/site-header';
import { SiteFooter } from '@/components/nav/site-footer';
import { HistoryList } from '@/components/dashboard/history-list';
import { ProfileStrip } from '@/components/dashboard/profile-strip';

export const metadata: Metadata = {
  title: 'History',
  description: 'Every freestyle you have run, with its full breakdown.',
};

export default function HistoryPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-[clamp(2.25rem,7vw,3.25rem)] font-black leading-[0.95]">
            History
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            Sessions are stored on this device only. Nothing is uploaded, and you can
            delete everything from Settings at any time.
          </p>

          <div className="mt-8">
            <ProfileStrip />
          </div>

          <div className="mt-6">
            <HistoryList />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
