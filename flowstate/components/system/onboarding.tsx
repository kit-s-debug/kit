'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/app-store';
import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/nav/wordmark';
import { StudioBackdrop } from '@/components/landing/studio-backdrop';

const SCREENS = [
  {
    title: 'Meet your freestyle partner.',
    body: 'FLOWSTATE listens while you rap and puts the next rhyme in front of you before you need it.',
  },
  {
    title: 'Pick a beat.',
    body: 'Ten beats from 78 to 146 BPM. They are generated in your browser, so they start instantly.',
  },
  {
    title: 'Start rapping.',
    body: 'A short count-in, then the beat runs and your microphone opens. It closes again the moment you finish.',
  },
  {
    title: 'We will help you keep your flow.',
    body: 'Rhymes, ideas and a breakdown at the end. Turn the help down as you get better.',
  },
];

export function Onboarding() {
  const router = useRouter();
  const updatePreferences = useAppStore((state) => state.updatePreferences);
  const [index, setIndex] = useState(0);

  const finish = () => {
    updatePreferences({ onboardingComplete: true });
    router.push('/freestyle');
  };

  const screen = SCREENS[index]!;
  const last = index === SCREENS.length - 1;

  return (
    <main id="main" className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-5 py-12">
      <StudioBackdrop />

      <div className="relative w-full max-w-md">
        <Wordmark />

        <div className="mt-10">
          <span className="tabular text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
            {`${index + 1}`.padStart(2, '0')} / {`${SCREENS.length}`.padStart(2, '0')}
          </span>
          <h1
            key={screen.title}
            className="animate-rise mt-4 font-display text-[clamp(2rem,8vw,2.75rem)] font-black leading-[1.02]"
          >
            {screen.title}
          </h1>
          <p key={screen.body} className="animate-rise mt-4 text-[16px] leading-relaxed text-muted">
            {screen.body}
          </p>
        </div>

        <div className="mt-10 flex items-center gap-2" aria-hidden="true">
          {SCREENS.map((item, dotIndex) => (
            <span
              key={item.title}
              className={`h-1 rounded-full transition-all duration-300 ${
                dotIndex === index ? 'w-8 bg-accent' : 'w-3 bg-line'
              }`}
            />
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          {last ? (
            <Button size="lg" fullWidth onClick={finish}>
              Let&rsquo;s Go
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="lg"
                onClick={finish}
                aria-label="Skip onboarding"
              >
                Skip
              </Button>
              <Button size="lg" className="flex-1" onClick={() => setIndex((i) => i + 1)}>
                Next
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
