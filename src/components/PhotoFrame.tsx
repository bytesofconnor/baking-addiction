import { cn } from "@/lib/utils";

export function PhotoFrame({
  src,
  alt,
  className,
  size = "frame",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  size?: "frame" | "hero";
}) {
  if (!src) {
    return null;
  }

  return (
    <figure
      className={cn(
        "photo-plate",
        size === "hero" ? "photo-plate-hero" : "photo-plate-frame",
        className,
      )}
    >
      <span className="photo-plate-tape photo-plate-tape-left" aria-hidden="true" />
      <span className="photo-plate-tape photo-plate-tape-right" aria-hidden="true" />
      <div className="photo-plate-mat">
        <div className="photo-plate-well">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="photo-plate-img"
          />
        </div>
      </div>
    </figure>
  );
}
