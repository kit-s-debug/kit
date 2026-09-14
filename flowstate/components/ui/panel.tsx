import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export function Panel({
  className = '',
  children,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={`panel ${className}`} {...props}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">
      {children}
    </span>
  );
}

export function Divider({ className = '' }: { className?: string }) {
  return <hr className={`border-0 border-t border-line-soft ${className}`} />;
}
