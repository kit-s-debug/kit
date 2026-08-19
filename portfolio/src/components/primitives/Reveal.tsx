"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE, viewportOnce } from "../../lib/motion";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

/* Scroll reveal. Used to give a section a reading order on arrival, not to
   decorate. Collapses to nothing when the visitor asks for reduced motion. */
export function Reveal({ children, delay = 0, y = 22, className }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
