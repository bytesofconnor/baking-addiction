import { Link } from "react-router";
import { Kicker } from "@/components/Kicker";
import { PageTitle } from "@/lib/pageTitle";
import { SITE_SHORT } from "@/lib/site";

export function NotFoundPage() {
  return (
    <div className="max-w-[32rem]">
      <PageTitle title={`Not in this book · ${SITE_SHORT}`} />
      <Kicker>Page not found</Kicker>
      <h1 className="font-display mt-3 text-[2.5rem] leading-[1.1] tracking-tight">
        That page isn&apos;t in this notebook
      </h1>
      <p className="mt-4 text-[19px] leading-8 text-ink-soft">
        The cookbook is still here. This address just doesn&apos;t go anywhere.
      </p>
      <p className="mt-8">
        <Link
          to="/"
          className="inline-flex min-h-14 cursor-pointer items-center text-[18px] underline decoration-rule underline-offset-[6px] transition-colors duration-150 hover:text-cinnamon-deep hover:decoration-cinnamon-deep active:text-cocoa"
        >
          Back to the cookbook
        </Link>
      </p>
    </div>
  );
}
