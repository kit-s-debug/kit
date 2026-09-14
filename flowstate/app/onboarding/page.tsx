import type { Metadata } from 'next';
import { Onboarding } from '@/components/system/onboarding';

export const metadata: Metadata = {
  title: 'Welcome',
  description: 'A ninety-second introduction to FLOWSTATE.',
};

export default function OnboardingPage() {
  return <Onboarding />;
}
