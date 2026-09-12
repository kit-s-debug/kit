import Image from "next/image";

/**
 * The garden, cut off the flat ground it was drawn on and set into the corner
 * of the About page — which is how it was cropped to begin with.
 *
 * It sits on the same plane as the greenery: behind the type, drifting with it
 * on scroll, no pointer, nothing announced.
 */
const SCENES = {
  garden: { file: "scene-garden.png", w: 480, h: 415 },
} as const;

export function Scene({
  name,
  size,
  className = "",
  flip = false,
}: {
  name: keyof typeof SCENES;
  /** Width in pixels; the height follows the drawing's own proportions. */
  size: number;
  className?: string;
  flip?: boolean;
}) {
  const scene = SCENES[name];
  return (
    <Image
      src={`/images/${scene.file}`}
      alt=""
      aria-hidden="true"
      width={scene.w}
      height={scene.h}
      sizes={`${size}px`}
      className={`scene scene-${name} ${className}`}
      style={{ width: size, height: "auto", ...(flip ? { transform: "scaleX(-1)" } : null) }}
    />
  );
}
