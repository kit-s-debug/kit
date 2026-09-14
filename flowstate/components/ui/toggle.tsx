'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <label
      className={`flex items-start justify-between gap-4 ${
        disabled ? 'opacity-50' : 'cursor-pointer'
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-text">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[13px] leading-snug text-muted">{description}</span>
        ) : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 ${
          checked ? 'border-accent/60 bg-accent/80' : 'border-line bg-ink'
        }`}
      >
        <span
          className={`absolute top-1/2 block h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-[left] duration-200 ease-out ${
            checked ? 'left-6' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  );
}
