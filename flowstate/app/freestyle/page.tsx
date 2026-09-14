import type { Metadata } from 'next';
import { FreestyleExperience } from '@/components/freestyle/freestyle-experience';

export const metadata: Metadata = {
  title: 'Freestyle',
  description: 'Pick a beat, start rapping, and get rhymes and ideas in real time.',
};

export default function FreestylePage() {
  return <FreestyleExperience />;
}
