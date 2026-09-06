"use client";
import { ArrowRight } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { Magnetic } from "./Magnetic";

type Variant = "solid" | "ghost" | "text";

const base =
  "group relative inline-flex items-center gap-2.5 whitespace-nowrap text-[0.95rem] font-medium " +
  "transition-[background-color,border-color,color,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98]";

const styles: Record<Variant, string> = {
  solid: "rounded-pill px-6 py-3.5 bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:bg-[var(--btn-bg-hover)]",
  ghost:
    "rounded-pill px-6 py-3.5 border border-[var(--line)] text-[var(--fg)] hover:border-[var(--fg)] hover:bg-[var(--line-soft)]",
  text: "text-[var(--fg)] pb-1",
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  magnetic?: boolean;
  icon?: boolean;
  className?: string;
} & (
  | ({ href: string } & Omit<ComponentProps<"a">, "className">)
  | ({ href?: undefined } & Omit<ComponentProps<"button">, "className">)
);

export function Cta({ children, variant = "solid", magnetic = true, icon = true, className = "", ...rest }: Props) {
  const inner = (
    <>
      <span className={variant === "text" ? "relative" : undefined}>
        {children}
        {variant === "text" && (
          <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--accent-graphic)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
        )}
      </span>
      {icon && (
        <ArrowRight
          size={16}
          weight="regular"
          aria-hidden
          className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
        />
      )}
    </>
  );

  const cls = `${base} ${styles[variant]} ${className}`;
  const el =
    "href" in rest && rest.href !== undefined ? (
      <a className={cls} {...(rest as ComponentProps<"a">)}>
        {inner}
      </a>
    ) : (
      <button className={cls} {...(rest as ComponentProps<"button">)}>
        {inner}
      </button>
    );

  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}
