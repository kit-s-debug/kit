import type { Transition } from "motion/react";

/* One easing curve and one spring for the whole site, so every moving thing
   feels like it belongs to the same object. */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const enter: Transition = { duration: 0.7, ease: EASE };
export const swift: Transition = { duration: 0.4, ease: EASE };
export const spring: Transition = { type: "spring", stiffness: 140, damping: 18, mass: 0.6 };

export const viewportOnce = { once: true, amount: 0.25 } as const;
