import { useScroll, useTransform, type Transition } from "motion/react";
import type { RefObject } from "react";

/* One easing curve and one spring for the whole site, so every moving thing
   feels like it belongs to the same object. */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const enter: Transition = { duration: 0.7, ease: EASE };
export const swift: Transition = { duration: 0.4, ease: EASE };
export const spring: Transition = { type: "spring", stiffness: 140, damping: 18, mass: 0.6 };

export const viewportOnce = { once: true, amount: 0.25 } as const;

/* A section's heading drifts a little as it passes through the viewport —
   the same trick Hero and the Eddie Rocks case study already used on their
   own, pulled out so every section can share it. It is what makes the page
   feel like one continuous piece of ground rather than a stack of separate
   cards that happen to sit end to end: nothing about the alternating light
   and dark grounds changes, only how the content sitting on each one moves.
   Callers pass reduce ? undefined : the returned value to style.y themselves,
   since useReducedMotion is a hook and cannot be called in here on their
   behalf. */
export function useDrift(ref: RefObject<HTMLElement | null>, distance = 26) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return useTransform(scrollYProgress, [0, 1], [distance, -distance]);
}
