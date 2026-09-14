import type { Metadata } from 'next';
import { SiteHeader } from '@/components/nav/site-header';
import { SiteFooter } from '@/components/nav/site-footer';
import { SessionDetail } from '@/components/analysis/session-detail';

export const metadata: Metadata = {
  title: 'Session',
  description: 'The full breakdown for a saved freestyle.',
};

export default function SessionPage() {
  return (
    <>
      <SiteHeader />
      <SessionDetail />
      <SiteFooter />
    </>
  );
}
