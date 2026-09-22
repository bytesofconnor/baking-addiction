import { cn } from "@/lib/utils";

function initialFor(name: string) {
  const letter = name.trim().charAt(0);
  return letter.length > 0 ? letter.toUpperCase() : "?";
}

export function BakerAvatar({
  name,
  url,
  size = "sm",
  className,
}: {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim =
    size === "lg" ? "book-baker-face-lg" : size === "md" ? "book-baker-face-md" : "book-baker-face-sm";

  if (url) {
    return (
      <img
        src={url}
        alt=""
        className={cn("book-baker-face", dim, className)}
        decoding="async"
      />
    );
  }

  return (
    <span
      className={cn("book-baker-face book-baker-face-initial", dim, className)}
      aria-hidden="true"
    >
      {initialFor(name)}
    </span>
  );
}

export function BakerName({
  name,
  url,
  size = "sm",
  className,
}: {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span className={cn("book-baker-name", className)}>
      <BakerAvatar name={name} url={url} size={size} />
      <span>{name}</span>
    </span>
  );
}
