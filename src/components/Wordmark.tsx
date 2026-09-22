import { Link } from "react-router";
import { usePreview } from "@/lib/preview";
import { SITE_SHORT } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Wordmark({
  linked = true,
  lead = "The Family Recipe",
  accent = "Book",
  compact = false,
}: {
  linked?: boolean;
  lead?: string;
  accent?: string;
  compact?: boolean;
}) {
  const mark = (
    <span
      className={cn(
        "inline-block min-w-0 font-display font-extrabold leading-[0.95]",
        compact
          ? "min-h-[2.1rem] text-[1.7rem] md:min-h-[2.45rem] md:text-[2.05rem]"
          : "text-[2.25rem] md:text-[2.7rem]",
      )}
    >
      {lead}
      {lead && accent ? " " : null}
      {accent ? (
        <span className="inline-block origin-bottom-left -rotate-3 italic text-cinnamon-deep transition-colors duration-150 group-hover:text-cocoa group-active:text-cocoa">
          {accent}
        </span>
      ) : null}
    </span>
  );

  const { keep } = usePreview();

  if (!linked) {
    return mark;
  }

  return (
    <Link
      to={keep("/")}
      className="group inline-block min-w-0"
      aria-label={`${SITE_SHORT}, back to the recipe book`}
    >
      {mark}
    </Link>
  );
}
