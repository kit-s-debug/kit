/**
 * Wordmark for the demo: a route-line "S" monogram (start point to destination)
 * with the business name. Original artwork, easy to swap for the owner's own logo.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden className="shrink-0">
        <rect x="0.5" y="0.5" width="33" height="33" rx="9" fill="#0f1a2e" stroke="rgba(233,171,60,0.45)" />
        <path d="M23 9.5h-8.5a4 4 0 0 0 0 8h5a4 4 0 0 1 0 8H11" fill="none" stroke="#e9ab3c" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="23.5" cy="9.5" r="2.2" fill="#f4efe6" />
        <circle cx="10.5" cy="25.5" r="2.2" fill="#e9ab3c" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="display-wide text-[0.95rem] text-ivory">Speedy Cabs</span>
        <span className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.28em] text-fog">&amp; Minibus · Haverfordwest</span>
      </span>
    </span>
  );
}
