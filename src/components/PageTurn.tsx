import { ButtonLink } from "@/components/ui/button";
import { CookbookBack } from "@/components/CookbookBack";

export function PageTurn({
  older,
  newer,
}: {
  older?: { slug: string; title: string } | null;
  newer?: { slug: string; title: string } | null;
}) {
  return (
    <nav
      aria-label="More bakes in the cookbook"
      className="mt-14 flex flex-col gap-3 border-t border-rule pt-8"
    >
      <CookbookBack />
      {older ? (
        <ButtonLink
          to={`/bakes/${older.slug}`}
          variant="secondary"
          className="h-auto w-full flex-col items-start py-3 text-left"
        >
          <span className="text-[16px] font-medium text-ink-soft">
            Previous bake
          </span>
          <span className="font-display text-[1.25rem] leading-8">
            {older.title}
          </span>
        </ButtonLink>
      ) : null}
      {newer ? (
        <ButtonLink
          to={`/bakes/${newer.slug}`}
          variant="secondary"
          className="h-auto w-full flex-col items-start py-3 text-left"
        >
          <span className="text-[16px] font-medium text-ink-soft">
            Next bake
          </span>
          <span className="font-display text-[1.25rem] leading-8">
            {newer.title}
          </span>
        </ButtonLink>
      ) : null}
    </nav>
  );
}
