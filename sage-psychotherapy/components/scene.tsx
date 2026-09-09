import Image from "next/image";

/**
 * The four illustrations, cut off the flat backgrounds they were drawn on and
 * set into the empty corners of the light rooms.
 *
 * They sit on the same plane as the greenery — behind the type, drifting with
 * it, no pointer, nothing announced — so the page still reads as one thing
 * rather than as a layout with pictures dropped into it. They are kept to the
 * paper fields: cut out, they are light drawings, and light drawings on the
 * ink fields would glow rather than settle.
 */
const SCENES = {
  room: { file: "scene-room.png", w: 420, h: 420 },
  rest: { file: "scene-rest.png", w: 400, h: 423 },
  garden: { file: "scene-garden.png", w: 480, h: 415 },
  growth: { file: "scene-growth.png", w: 460, h: 329 },
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
