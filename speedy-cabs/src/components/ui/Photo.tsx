import { photos, type PhotoId, type PhotoMeta } from "@/lib/photos";

/**
 * Responsive photograph from /public/photos. Every image is a licensed
 * Wikimedia Commons photo; credits are listed in the footer.
 */
export function Photo({
  id,
  sizes = "100vw",
  className = "",
  priority = false,
  alt,
}: {
  id: PhotoId;
  sizes?: string;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  const p: PhotoMeta = photos[id];
  const srcSet = p.widths.map((w) => `/photos/${id}-${w}.webp ${w}w`).join(", ");
  const fallback = `/photos/${id}-${p.widths[Math.min(1, p.widths.length - 1)]}.webp`;
  return (
    <img
      src={fallback}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt ?? p.alt}
      width={p.width}
      height={p.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
      style={{ objectPosition: p.focus ?? "50% 50%" }}
    />
  );
}
