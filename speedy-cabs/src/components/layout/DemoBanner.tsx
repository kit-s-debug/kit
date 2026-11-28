"use client";

import { useEffect, useState } from "react";
import { business } from "@/lib/business";
import { CloseIcon } from "../ui/Icons";

/** Visible only while `demoMode` is on: explains the † markers to the owner. */
export function DemoBanner() {
  const [open, setOpen] = useState(true);
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!business.demoMode || !open || !past) return null;
  return (
    <div
      role="note"
      className="fixed bottom-[5.25rem] left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-start gap-3 rounded-2xl border border-gold/25 bg-navy/95 p-3 text-[0.82rem] sm:p-4 leading-snug text-mist shadow-2xl backdrop-blur md:bottom-6 md:left-6 md:translate-x-0"
    >
      <span className="mt-0.5 rounded-full bg-gold/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-gold">Demo</span>
      <p className="hidden sm:block">
        A demonstration site prepared for {business.name}. Items marked <span className="text-gold">†</span> are business claims the
        owner must confirm before launch.
      </p>
      <p className="sm:hidden">
        Demo site. <span className="text-gold">†</span> = owner to confirm before launch.
      </p>
      <button type="button" onClick={() => setOpen(false)} className="-m-1 rounded-full p-1 text-fog hover:text-ivory" aria-label="Dismiss demo note">
        <CloseIcon width={16} height={16} />
      </button>
    </div>
  );
}
