import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'live';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const BASE =
  'relative inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap ' +
  'transition-[transform,background-color,border-color,opacity] duration-200 ease-out ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 select-none';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-[#180700] hover:bg-accent-soft shadow-[0_10px_40px_-16px_rgba(255,106,43,0.9)]',
  secondary:
    'bg-raised text-text border border-line hover:border-faint hover:bg-[#1c1c26]',
  ghost: 'text-muted hover:text-text hover:bg-white/5',
  danger: 'bg-[#2a1116] text-live border border-[#4a1a24] hover:bg-[#3a151c]',
  live: 'bg-live text-white shadow-[0_10px_40px_-14px_rgba(255,51,85,0.9)] hover:brightness-110',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-lg',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-14 px-7 text-base rounded-2xl',
  xl: 'h-16 px-8 text-lg rounded-2xl',
};

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export interface ButtonLinkProps extends ComponentPropsWithoutRef<typeof Link> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className = '',
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
