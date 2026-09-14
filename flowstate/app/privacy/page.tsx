import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/nav/site-header';
import { SiteFooter } from '@/components/nav/site-footer';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What FLOWSTATE does with your microphone, your words and your data.',
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="px-4 py-10 sm:px-6">
        <article className="mx-auto max-w-2xl">
          <h1 className="font-display text-[clamp(2.25rem,7vw,3.25rem)] font-black leading-[0.95]">
            Privacy
          </h1>
          <p className="mt-3 text-[13px] text-faint">
            Placeholder policy for the MVP. It describes what the current build actually
            does, and should be reviewed by a lawyer before any public launch.
          </p>

          <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-muted">
            <section>
              <h2 className="font-display text-lg font-extrabold text-text">Your microphone</h2>
              <p className="mt-2">
                The microphone is opened when you start a freestyle and released when the
                session ends, you leave the screen, or you switch to Demo Mode. It is never
                opened on any other page.
              </p>
              <p className="mt-2">
                FLOWSTATE does not record, save or upload audio. The audio stream is used
                for two things while a session runs: drawing the waveform, and detecting
                when you start each phrase so beat timing can be measured. Both happen in
                your browser and neither is stored.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-text">
                Speech recognition
              </h2>
              <p className="mt-2">
                Transcription uses the Web Speech API built into your browser. This is
                important to understand: in Chrome and Edge, that API sends audio to the
                browser vendor&rsquo;s speech service for processing. That transfer is
                made by the browser, not by FLOWSTATE, and is governed by your
                browser vendor&rsquo;s privacy policy.
              </p>
              <p className="mt-2">
                If you would rather no audio left your device, use Demo Mode — it runs a
                scripted transcript and never opens the microphone at all.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-text">
                Rhymes and scoring
              </h2>
              <p className="mt-2">
                The rhyme engine, topic detection and every number on the results screen
                run entirely in your browser. No network request is needed for them, and
                none is made.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-text">
                The hosted AI model
              </h2>
              <p className="mt-2">
                If the operator of this instance has configured an AI provider key, two
                things are sent to that provider: a short slice of recent transcript text
                when line ideas are requested during a session, and the session transcript
                once when the results screen asks for written observations. Audio is never
                sent. You can see whether a provider is connected in{' '}
                <Link href="/settings" className="underline hover:text-text">
                  Settings
                </Link>
                .
              </p>
              <p className="mt-2">
                With no key configured — the default — nothing is sent anywhere, and the
                on-device engine supplies both the rhymes and the observations.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-text">Storage</h2>
              <p className="mt-2">
                Sessions, settings and progress are kept in your browser&rsquo;s local
                storage on this device. There are no accounts and no server-side database
                in this build, so your history does not follow you to another browser or
                device.
              </p>
              <p className="mt-2">
                You can switch off transcript storage, delete your session history, or
                delete everything from{' '}
                <Link href="/settings" className="underline hover:text-text">
                  Settings
                </Link>
                . Clearing site data in your browser has the same effect.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-extrabold text-text">
                What is not collected
              </h2>
              <p className="mt-2">
                No account, no email address, no name, no analytics, no advertising
                identifiers and no third-party trackers. The only personal information
                involved is what you choose to say into the microphone.
              </p>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
