import { ButtonLink } from "@/components/ui/button";
import { CookbookBack } from "@/components/CookbookBack";

export function PageTurn({
  older,
  newer,
  search = "",
}: {
  older?: { slug: string; title: string } | null;
  newer?: { slug: string; title: string } | null;
  search?: string;
}) {
  const suffix = search.length > 0 ? `?${search}` : "";
  return (
    <nav
      aria-label="More bakes in the recipe book"
      className="mt-14 flex flex-col gap-3 border-t border-rule pt-8"
    >
      <CookbookBack className="self-start" />
      {older ? (
        <ButtonLink
          to={`/bakes/${older.slug}${suffix}`}
          variant="secondary"
          className="h-auto w-full flex-col items-start py-3 text-left"
          aria-label={`The one before: ${older.title}`}
        >
          <span className="text-[16px] font-medium text-ink-soft">
            The one before
          </span>
          <span className="font-display text-[1.25rem] leading-8">
            {older.title}
          </span>
        </ButtonLink>
      ) : null}
      {newer ? (
        <ButtonLink
          to={`/bakes/${newer.slug}${suffix}`}
          variant="secondary"
          className="h-auto w-full flex-col items-start py-3 text-left"
          aria-label={`The one after: ${newer.title}`}
        >
          <span className="text-[16px] font-medium text-ink-soft">
            The one after
          </span>
          <span className="font-display text-[1.25rem] leading-8">
            {newer.title}
          </span>
        </ButtonLink>
      ) : null}
    </nav>
  );
}
