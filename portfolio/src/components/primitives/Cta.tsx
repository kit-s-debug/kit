"use client";
import { ArrowRight } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { Magnetic } from "./Magnetic";

type Variant = "solid" | "ghost";

const base =
  "group relative inline-flex items-center gap-2.5 rounded-pill px-6 py-3.5 text-[0.95rem] font-medium whitespace-nowrap " +
  "transition-[background-color,border-color,color,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98]";

const styles: Record<Variant, string> = {
  solid: "bg-chalk text-ink hover:bg-white",
  ghost: "border border-[var(--color-slate-line)] text-chalk hover:border-chalk/45 hover:bg-white/[0.04]",
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
      <span>{children}</span>
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
