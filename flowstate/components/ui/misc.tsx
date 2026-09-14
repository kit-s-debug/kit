import Link from 'next/link';
import type { ReactNode } from 'react';

export function Tag({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'live' | 'ai' | 'gold';
}) {
  const tones = {
    neutral: 'border-line text-muted',
    accent: 'border-accent/40 text-accent-soft bg-accent/10',
    live: 'border-live/40 text-live bg-live/10',
    ai: 'border-ai/30 text-ai bg-ai/10',
    gold: 'border-gold/30 text-gold bg-gold/10',
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="panel flex flex-col items-center gap-3 px-6 py-12 text-center">
      <h3 className="font-display text-lg font-extrabold">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-muted">{body}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#180700] transition-colors hover:bg-accent-soft"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

/** Three dots that mean "the AI layer is thinking", never a blocking spinner. */
export function ThinkingDots({ label = 'Thinking' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ai">
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-ai"
          style={{
            animation: 'sheen 1.1s ease-in-out infinite',
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
      <span aria-hidden="true">{label}</span>
    </span>
  );
}

export function ErrorNotice({
  title,
  body,
  actions,
}: {
  title: string;
  body: string;
  actions?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-[#4a1a24] bg-[#1c0d11] px-4 py-4"
    >
      <div className="flex items-start gap-3">
        <svg viewBox="0 0 24 24" width="18" height="18" className="mt-0.5 shrink-0 text-live" aria-hidden="true">
          <path
            d="M12 8v5M12 16.5v.5M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">{body}</p>
          {actions ? <div className="mt-3 flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}
