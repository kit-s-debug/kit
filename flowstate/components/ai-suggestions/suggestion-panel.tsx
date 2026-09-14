'use client';

import { useSessionStore } from '@/lib/store/session-store';
import { ThinkingDots } from '@/components/ui/misc';
import type { AssistLevel, RhymeKind } from '@/types';
import { TOPIC_LABELS } from '@/lib/rhyme';

const KIND_LABEL: Record<RhymeKind, string> = {
  perfect: 'Perfect rhyme',
  near: 'Near rhyme',
  multi: 'Multisyllabic rhyme',
  assonance: 'Assonance',
};

const KIND_DOT: Record<RhymeKind, string> = {
  perfect: 'bg-accent',
  multi: 'bg-gold',
  near: 'bg-ai',
  assonance: 'bg-faint',
};

/**
 * Rhymes and line ideas, sized to be read at a glance while performing.
 *
 * Assistance level decides what appears: OFF shows nothing, HINTS shows rhymes
 * only, FULL adds line starters. Everything here is short by design — a long
 * suggestion is one you cannot use mid-bar.
 */
export function SuggestionPanel({ assist }: { assist: AssistLevel }) {
  const suggestions = useSessionStore((state) => state.suggestions);
  const aiPending = useSessionStore((state) => state.aiPending);

  if (assist === 'off') {
    return (
      <section className="panel px-4 py-5" aria-label="Suggestions">
        <p className="text-[13px] leading-relaxed text-faint">
          Assistance is off. Transcription and scoring are still running — you are
          freestyling on your own.
        </p>
      </section>
    );
  }

  const rhymes = suggestions?.rhymes ?? [];
  const ideas = suggestions?.ideas ?? [];
  const anchor = suggestions?.anchor ?? '';

  return (
    <section className="space-y-3" aria-label="Suggestions">
      <div className="panel px-4 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">
            Rhymes
          </h2>
          {suggestions?.topic ? (
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
              {TOPIC_LABELS[suggestions.topic]}
            </span>
          ) : null}
        </div>

        <p className="mt-1.5 font-display text-[15px] font-extrabold uppercase tracking-[0.08em] text-accent">
          {anchor || '—'}
        </p>

        <ul className="mt-3 flex flex-wrap gap-2">
          {rhymes.map((rhyme) => (
            <li key={`${rhyme.word}-${rhyme.kind}`}>
              <span
                title={KIND_LABEL[rhyme.kind]}
                className="animate-bar-in inline-flex items-center gap-2 rounded-xl border border-line-soft bg-ink px-3 py-2.5 text-[15px] font-semibold leading-none"
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_DOT[rhyme.kind]}`}
                />
                {rhyme.word}
                <span className="sr-only"> — {KIND_LABEL[rhyme.kind]}</span>
              </span>
            </li>
          ))}
          {rhymes.length === 0 ? (
            <li className="py-1 text-[14px] text-faint">
              Say a few more words and rhymes will appear here.
            </li>
          ) : null}
        </ul>
      </div>

      {assist === 'full' ? (
        <div className="panel px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">
              Ideas
            </h2>
            {aiPending ? <ThinkingDots label="Writing" /> : null}
          </div>

          <ul className="mt-3 space-y-2">
            {ideas.map((idea) => (
              <li
                key={idea.text}
                className="animate-bar-in rounded-xl border border-line-soft bg-ink px-3.5 py-3 text-[15px] leading-snug"
              >
                {idea.text}
              </li>
            ))}
            {ideas.length === 0 ? (
              <li className="text-[14px] text-faint">
                Line starters appear once a rhyme is locked in.
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
