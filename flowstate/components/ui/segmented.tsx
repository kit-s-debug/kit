'use client';

import { useId } from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (value: T) => void;
  /** Stack the options vertically with their hints visible. */
  detailed?: boolean;
}

/**
 * A radiogroup that behaves like one: arrow keys move between options and only
 * the selected control is in the tab order.
 */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  detailed = false,
}: SegmentedProps<T>) {
  const id = useId();

  const move = (direction: 1 | -1) => {
    const index = options.findIndex((option) => option.value === value);
    const next = options[(index + direction + options.length) % options.length];
    if (next) onChange(next.value);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={
        detailed
          ? 'grid gap-2'
          : 'grid auto-cols-fr grid-flow-col gap-1 rounded-2xl border border-line-soft bg-ink p-1'
      }
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          move(1);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          move(-1);
        }
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            id={`${id}-${option.value}`}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={
              detailed
                ? `rounded-2xl border p-4 text-left transition-colors duration-200 ${
                    selected
                      ? 'border-accent/60 bg-accent/10'
                      : 'border-line-soft bg-ink hover:border-line'
                  }`
                : `rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                    selected ? 'bg-raised text-text' : 'text-muted hover:text-text'
                  }`
            }
          >
            <span className={detailed ? 'block text-sm font-semibold text-text' : ''}>
              {option.label}
            </span>
            {detailed && option.hint ? (
              <span className="mt-1 block text-[13px] leading-snug text-muted">
                {option.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
