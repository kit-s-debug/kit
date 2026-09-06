import type { ReactNode } from "react";

/* A restrained browser chrome. One hairline, one slim bar, the address in
   small caps. No traffic light dots, no glass, nothing that dates it. */
export function BrowserFrame({
  url,
  children,
  className = "",
}: {
  url: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={`overflow-hidden border border-[var(--line)] bg-[var(--panel)] ${className}`}>
      <div className="flex items-center gap-3 border-b border-[var(--line)] px-3.5 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-[7px] w-[7px] rounded-pill bg-[var(--fg-2)] opacity-40" />
          <span className="h-[7px] w-[7px] rounded-pill bg-[var(--fg-2)] opacity-25" />
        </span>
        <span className="truncate text-[0.68rem] tracking-[0.14em] text-[var(--fg-2)] uppercase">{url}</span>
      </div>
      <div className="relative">{children}</div>
    </figure>
  );
}
