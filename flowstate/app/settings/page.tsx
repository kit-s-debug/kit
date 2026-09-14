import type { Metadata } from 'next';
import { SiteHeader } from '@/components/nav/site-header';
import { SiteFooter } from '@/components/nav/site-footer';
import { SettingsPanel } from '@/components/dashboard/settings-panel';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Microphone status, data controls and motion preferences.',
};

export default function SettingsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-[clamp(2.25rem,7vw,3.25rem)] font-black leading-[0.95]">
            Settings
          </h1>
          <div className="mt-8">
            <SettingsPanel />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
