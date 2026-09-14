import Link from 'next/link';
import { Wordmark } from '@/components/nav/wordmark';

export function SiteFooter() {
  return (
    <footer className="border-t border-line-soft px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Wordmark />
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-faint">
            Your microphone is only used while freestyle mode is active. Sessions are
            stored on this device.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
            <li><Link href="/beats" className="hover:text-text">Beats</Link></li>
            <li><Link href="/challenges" className="hover:text-text">Challenges</Link></li>
            <li><Link href="/history" className="hover:text-text">History</Link></li>
            <li><Link href="/settings" className="hover:text-text">Settings</Link></li>
            <li><Link href="/privacy" className="hover:text-text">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-text">Terms</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
