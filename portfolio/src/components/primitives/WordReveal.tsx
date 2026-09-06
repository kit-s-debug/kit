"use client";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE, viewportOnce } from "../../lib/motion";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  play?: "load" | "inView";
  as?: "h1" | "h2" | "p" | "span";
};

const word: Variants = {
  hidden: { opacity: 0, y: "110%" },
  shown: { opacity: 1, y: "0%", transition: { duration: 0.85, ease: EASE } },
};

/* Word-by-word mask reveal. The headline arrives in reading order, which is the
   only reason to animate a headline at all.

   The trigger lives on the heading, not on the words: each word sits inside an
   overflow-hidden mask, so while it is translated out of that mask it never
   intersects the viewport and an observer on the word itself would never fire. */
export function WordReveal({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  play = "inView",
  as = "h2",
}: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.h2;
  const words = text.split(" ");

  const container: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  return (
    <Tag
      className={className}
      variants={container}
      initial={reduce ? false : "hidden"}
      {...(play === "load" ? { animate: "shown" } : { whileInView: "shown", viewport: viewportOnce })}
    >
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] mr-[0.24em] align-bottom"
        >
          <motion.span className="inline-block" variants={word}>
            {w}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
