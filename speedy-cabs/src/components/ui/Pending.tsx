import { business } from "@/lib/business";

/** † marker shown in demo mode beside claims the owner still needs to confirm. */
export function Pending({ className = "" }: { className?: string }) {
  if (!business.demoMode) return null;
  return (
    <sup className={`ml-0.5 text-gold ${className}`} title="Owner to confirm before launch">
      †<span className="sr-only"> (to be confirmed by the owner)</span>
    </sup>
  );
}
