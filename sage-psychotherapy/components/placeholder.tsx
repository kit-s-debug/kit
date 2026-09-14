import type { Confirm } from "@/content/site";

/**
 * Anything the client still has to supply renders with a visible marker rather
 * than quietly pretending to be real. Set the status to "confirmed" in
 * content/site.ts and the marker disappears on its own.
 */
export function Placeholder({
  value,
  status,
  className = "",
}: {
  value: string;
  status: Confirm;
  className?: string;
}) {
  if (status === "confirmed") return <span className={className}>{value}</span>;
  return (
    <span className={`placeholder ${className}`}>
      {value}
      <span className="placeholder-tag">to confirm</span>
    </span>
  );
}

export function isPlaceholder(status: Confirm) {
  return status !== "confirmed";
}
