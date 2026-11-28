import { business, telHref } from "@/lib/business";
import { PhoneIcon } from "../ui/Icons";

/** Persistent call / book bar on small screens. */
export function MobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-midnight/92 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-2 gap-3">
        <a
          href={telHref(business.phones.primary.e164)}
          className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 text-[0.95rem] font-semibold text-ivory active:bg-white/5"
        >
          <PhoneIcon width={18} height={18} className="text-gold" />
          Call now
        </a>
        <a
          href="#book"
          className="flex h-12 items-center justify-center rounded-full bg-gold text-[0.95rem] font-semibold text-midnight active:bg-gold-soft"
        >
          Book a journey
        </a>
      </div>
    </div>
  );
}
