import { ButtonLink } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/panel';
import { SiteFooter } from '@/components/nav/site-footer';
import { SiteHeader } from '@/components/nav/site-header';
import { StudioBackdrop } from '@/components/landing/studio-backdrop';
import { HeroDemo } from '@/components/landing/hero-demo';
import { BEATS } from '@/lib/beats';
import { FAMILY_COUNT, LEXICON_SIZE } from '@/lib/rhyme';

const STEPS = [
  { n: '01', title: 'Pick a beat', body: 'Ten beats across six styles, from 78 to 146 BPM.' },
  { n: '02', title: 'Start rapping', body: 'Count-in, then the beat runs and the mic opens.' },
  { n: '03', title: 'AI listens', body: 'Your words are transcribed and read for rhyme and subject.' },
  { n: '04', title: 'Keep your flow', body: 'Rhymes and lines appear while the bar is still going.' },
];

const FEATURES = [
  {
    title: 'Real-time rhyme suggestions',
    body: 'Perfect, near and multisyllabic rhymes, ranked and on screen before the bar ends.',
  },
  {
    title: 'Context-aware ideas',
    body: 'Say you are chasing money and the suggestions lean into work, risk and pressure — not a dictionary dump.',
  },
  {
    title: 'Beat-synchronised',
    body: 'Every beat runs on a known grid, so bars are segmented against the actual tempo.',
  },
  {
    title: 'Flow analysis',
    body: 'Syllables per bar, pacing and gaps, measured from what you actually said.',
  },
  {
    title: 'Rhyme scoring',
    body: 'Chains, internals and multis are detected and shown back to you afterwards.',
  },
  {
    title: 'Daily challenges',
    body: 'One challenge a day — hold a rhyme chain, switch topic cleanly, stay in the pocket.',
  },
  {
    title: 'Performance history',
    body: 'Every session kept on your device, with its full breakdown and transcript.',
  },
  {
    title: 'Three difficulty levels',
    body: 'From full assistance to almost none, so you can work your way off the help.',
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero ------------------------------------------------------- */}
        <section className="relative isolate overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20">
          <StudioBackdrop />
          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-ink/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Freestyle partner
              </span>

              <h1 className="mt-6 font-display text-[clamp(3.25rem,13vw,7rem)] font-black leading-[0.86] tracking-[-0.045em]">
                FLOWSTATE
              </h1>
              <p className="mt-4 font-display text-[clamp(1.5rem,5vw,2.25rem)] font-extrabold leading-tight text-accent">
                Never lose your flow.
              </p>

              <p className="text-balance-tight mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
                An AI freestyle partner that listens to your bars and helps you find your
                next rhyme, idea and line in real time.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/freestyle" size="lg" className="sm:min-w-[15rem]">
                  Start Freestyling
                </ButtonLink>
                <ButtonLink href="/beats" size="lg" variant="secondary">
                  Explore Beats
                </ButtonLink>
              </div>

              <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
                {[
                  { label: 'Beats', value: String(BEATS.length) },
                  { label: 'Rhyme families', value: String(FAMILY_COUNT) },
                  { label: 'Words indexed', value: LEXICON_SIZE.toLocaleString('en-GB') },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
                      {stat.label}
                    </dt>
                    <dd className="tabular mt-1 font-display text-xl font-extrabold">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:pl-4">
              <HeroDemo />
            </div>
          </div>
        </section>

        {/* How it works ----------------------------------------------- */}
        <section className="border-t border-line-soft px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,6vw,3rem)] font-extrabold leading-[1.02]">
              Four steps, then you are rapping.
            </h2>

            <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step) => (
                <li key={step.n} className="bg-surface p-6">
                  <span className="tabular font-display text-sm font-black text-accent">
                    {step.n}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-extrabold">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features ---------------------------------------------------- */}
        <section className="border-t border-line-soft px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionLabel>Features</SectionLabel>
            <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,6vw,3rem)] font-extrabold leading-[1.02]">
              Built for the moment you are stuck.
            </h2>

            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="panel p-5">
                  <h3 className="font-display text-[15px] font-extrabold leading-snug">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{feature.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final CTA --------------------------------------------------- */}
        <section className="relative isolate overflow-hidden border-t border-line-soft px-4 py-24 sm:px-6">
          <div
            aria-hidden="true"
            className="animate-drift absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.18] blur-[120px]"
            style={{ background: 'radial-gradient(circle, #ff6a2b 0%, transparent 70%)' }}
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[clamp(2.25rem,8vw,4rem)] font-black leading-[0.95]">
              Your beat.
              <br />
              Your voice.
              <br />
              <span className="text-accent">Your flow.</span>
            </h2>
            <div className="mt-10 flex justify-center">
              <ButtonLink href="/freestyle" size="xl" className="min-w-[16rem]">
                Start Freestyling
              </ButtonLink>
            </div>
            <p className="mt-6 text-[13px] text-faint">
              Works without an account. Your microphone is only used while a freestyle is running.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
