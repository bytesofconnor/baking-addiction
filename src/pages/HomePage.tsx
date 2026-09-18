import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CookbookExplorer } from "@/components/CookbookExplorer";
import { PageTitle } from "@/lib/pageTitle";
import { SITE_NAME, SITE_SHORT } from "@/lib/site";

export function HomePage() {
  const bakes = useQuery(api.bakes.listPublished);

  if (bakes === undefined) {
    return (
      <>
        <PageTitle title={SITE_NAME} />
        <p role="status">Opening the cookbook…</p>
      </>
    );
  }

  if (bakes.length === 0) {
    return (
      <>
        <PageTitle title={SITE_NAME} />
        <p className="text-ink-soft">The cookbook is empty for now.</p>
      </>
    );
  }

  return (
    <div>
      <PageTitle title={`The cookbook · ${SITE_SHORT}`} />
      <CookbookExplorer bakes={bakes} />
    </div>
  );
}
