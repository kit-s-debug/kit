export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className="flex h-6 items-end gap-[2px]"
      >
        {[9, 16, 22, 13, 7].map((height, index) => (
          <span
            key={index}
            className="w-[3px] rounded-full bg-accent"
            style={{ height, opacity: Number((0.45 + index * 0.12).toFixed(2)) }}
          />
        ))}
      </span>
      <span className="font-display text-[17px] font-black tracking-[0.14em]">
        FLOWSTATE
      </span>
    </span>
  );
}
