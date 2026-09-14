import type { Metadata } from 'next';
import { SiteHeader } from '@/components/nav/site-header';
import { SiteFooter } from '@/components/nav/site-footer';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms of use for the FLOWSTATE MVP.',
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="px-4 py-10 sm:px-6">
        <article className="mx-auto max-w-2xl">
          <h1 className="font-display text-[clamp(2.25rem,7vw,3.25rem)] font-black leading-[0.95]">
            Terms of use
          </h1>
          <p className="mt-3 text-[13px] text-faint">
            Placeholder terms for the MVP. Replace with reviewed terms before launch.
          </p>

          <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-muted">
            <section>
              <h2 className="font-display text-lg font-extrabold text-text">The service</h2>
              <p className="mt-2">
                FLOWSTATE is a practice tool. It is provided as-is, without warranty, and
                may change or stop working at any time during development.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-text">Your words</h2>
              <p className="mt-2">
                Anything you write or perform is yours. FLOWSTATE claims no rights over it
                and, in this build, never receives a copy of it on a server unless a hosted
                AI provider has been configured by the operator — see the privacy page.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-text">The beats</h2>
              <p className="mt-2">
                Every beat is generated in your browser from patterns written for this
                project. No third-party recordings, samples or commercial instrumentals are
                used, so there is nothing to clear for personal practice. If a future
                version adds licensed audio, its licence terms will be stated alongside it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-text">Fair use</h2>
              <p className="mt-2">
                Do not use FLOWSTATE to produce content that is unlawful, harassing, or
                targets a real person. Do not attempt to overload or abuse the AI endpoints.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-text">Scores</h2>
              <p className="mt-2">
                Scores are computed from an automatic transcript and a simple phonetic
                model. They are a rough signal for practice, not a judgement of your
                ability, and transcription errors will move them.
              </p>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
