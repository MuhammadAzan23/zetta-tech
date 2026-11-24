/**
 * Product image: server-rendered, fade-in handled by CSS so there is no per-card
 * hydration cost. Lazy by default; `priority` for the LCP image on a detail page.
 */
export default function ProductImage({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  width = 480,
  height = 360,
  priority = false,
}: {
  src?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    <span className={className ? `block ${className}` : "contents"}>
      {src ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className={`img-fade-in ${imgClassName}`}
        />
      ) : (
        <span className="label text-navy-900/70">Image unavailable</span>
      )}
    </span>
  );
}
