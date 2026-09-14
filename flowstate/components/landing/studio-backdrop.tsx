/**
 * The landing backdrop: a dark room with light on a desk.
 *
 * Built from transform-and-opacity animations only — three blurred colour
 * fields drifting, a perspective floor grid, and a row of level meters that
 * breathe. Nothing here animates a layout property, so it stays at frame rate
 * on a phone, and all of it stops under prefers-reduced-motion.
 */
export function StudioBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Colour fields */}
      <div
        className="animate-drift absolute -left-[20%] -top-[30%] h-[70vh] w-[70vh] rounded-full opacity-[0.22] blur-[110px]"
        style={{ background: 'radial-gradient(circle, #ff6a2b 0%, transparent 68%)' }}
      />
      <div
        className="animate-drift-slow absolute -right-[15%] top-[5%] h-[60vh] w-[60vh] rounded-full opacity-[0.16] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #7b3bff 0%, transparent 70%)' }}
      />
      <div
        className="animate-drift absolute bottom-[-25%] left-[25%] h-[55vh] w-[55vh] rounded-full opacity-[0.12] blur-[130px]"
        style={{ background: 'radial-gradient(circle, #6fe3cf 0%, transparent 72%)' }}
      />

      {/* Perspective floor grid */}
      <div
        className="absolute inset-x-0 bottom-0 h-[46vh] opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px),' +
            'linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          transform: 'perspective(340px) rotateX(62deg)',
          transformOrigin: 'bottom',
          maskImage: 'linear-gradient(to top, black 0%, transparent 80%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 80%)',
        }}
      />

      {/* Level meters along the bottom edge */}
      <div className="absolute inset-x-0 bottom-0 flex h-24 items-end justify-center gap-[3px] px-4 opacity-30">
        {Array.from({ length: 64 }).map((_, index) => (
          <span
            key={index}
            className="w-[3px] flex-none rounded-full bg-gradient-to-t from-accent/70 to-accent-soft/10"
            style={{
              height: `${(14 + Math.abs(Math.sin(index * 0.7)) * 58).toFixed(2)}%`,
              animation: 'sheen 4s ease-in-out infinite',
              animationDelay: `${((index % 11) * 0.18).toFixed(2)}s`,
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, transparent 30%, rgba(6,6,9,0.75) 78%, #060609 100%)',
        }}
      />
    </div>
  );
}
