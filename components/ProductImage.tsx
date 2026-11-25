import Image from "next/image";

/**
 * Product image.
 *
 * Uses `next/image` so the feed's originals — many of them 1–1.6 MB PNGs at
 * 2000px wide — are resized and re-encoded per breakpoint instead of being sent
 * whole to a 300px card. The wrapper is positioned, so the image fills the space
 * its parent already gives it (the 4:3 card tile, the gallery frame) and crops
 * nothing: `object-contain` keeps the product cut-out intact.
 *
 * `sizes` is required here: the browser needs to know the rendered width before
 * layout to pick a source, and the default 100vw would over-download on cards.
 */
export default function ProductImage({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  sizes = "(min-width: 1280px) 22rem, (min-width: 768px) 33vw, 92vw",
  priority = false,
}: {
  src?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  /** Rendered width hint, so one card does not fetch a full-bleed image. */
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) {
    return <span className="eyebrow text-navy-900/70">Image unavailable</span>;
  }

  return (
    <span className={`product-image ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        // Cards are below the fold; the gallery's first image passes `priority`.
        loading={priority ? undefined : "lazy"}
        className={`object-contain ${imgClassName}`}
      />
    </span>
  );
}
