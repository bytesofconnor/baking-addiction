import { Wordmark } from "@/components/Wordmark";
import { useBookHeading } from "@/lib/bookHeading";
import { pageHeading } from "@/lib/site";

export function SiteHeader({
  pathname = "/",
}: {
  pathname?: string;
}) {
  const bookHeading = useBookHeading();
  const heading = pageHeading(pathname, bookHeading?.recipeTitle);

  return (
    <header>
      <div>
        <Wordmark
          linked={heading.home}
          lead={heading.lead}
          accent={heading.accent}
          compact={heading.compact}
        />
      </div>
    </header>
  );
}
