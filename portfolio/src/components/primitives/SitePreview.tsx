"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserFrame } from "./BrowserFrame";

/* A website inside a browser frame, scrolling itself.

   The recording plays only while it is on screen and only while the tab is
   visible, so an idle preview costs nothing. Anyone who has asked for reduced
   motion, or whose browser cannot decode WebM, gets the still frame instead of
   a dead element. */
export function SitePreview({
  url,
  src,
  poster,
  alt,
  priority = false,
  className = "",
  frameClassName = "",
}: {
  url: string;
  src: string;
  poster: string;
  alt: string;
  priority?: boolean;
  className?: string;
  frameClassName?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playable, setPlayable] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canWebm = Boolean(document.createElement("video").canPlayType('video/webm; codecs="vp8"'));
    setPlayable(!reduce && canWebm);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!playable || !v) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !document.hidden) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(v);

    const onVisibility = () => {
      if (document.hidden) v.pause();
      else if (v.getBoundingClientRect().top < window.innerHeight) void v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [playable]);

  return (
    <BrowserFrame url={url} className={frameClassName}>
      <div className={`relative aspect-[1200/676] w-full overflow-hidden bg-[var(--color-ink-2)] ${className}`}>
        <img
          src={poster}
          alt={alt}
          width={1200}
          height={676}
          {...(priority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {playable && (
          <video
            ref={ref}
            className="absolute inset-0 h-full w-full object-cover"
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            preload={priority ? "auto" : "metadata"}
            aria-label={alt}
          />
        )}
      </div>
    </BrowserFrame>
  );
}
