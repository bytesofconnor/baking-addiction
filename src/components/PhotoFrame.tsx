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
    <figure className={cn("relative", size === "hero" ? "mb-8" : "mb-10", className)}>
      <span
        aria-hidden="true"
        className="absolute -top-2 left-6 h-5 w-16 rotate-[-8deg] bg-cinnamon/25"
      />
      <span
        aria-hidden="true"
        className="absolute -top-1 right-10 h-5 w-14 rotate-[12deg] bg-cocoa/20"
      />
      <img
        src={src}
        alt={alt}
        className={cn(
          "block w-full border border-rule object-cover",
          size === "hero" && "aspect-[4/3] max-h-[min(40rem,70vh)]",
        )}
      />
    </figure>
  );
}
