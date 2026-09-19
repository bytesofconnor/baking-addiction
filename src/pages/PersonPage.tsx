import { Link, useParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { CookbookExplorer } from "@/components/CookbookExplorer";
import { RedirectToJoin } from "@/components/RedirectToJoin";
import { useFamily } from "@/lib/family";
import { PageTitle } from "@/lib/pageTitle";
import { usePreview } from "@/lib/preview";
import { SITE_SHORT } from "@/lib/site";

export function PersonPage() {
  const { userId } = useParams();
  const { status, user } = useFamily();
  const { keep } = usePreview();
  const connections = useQuery(
    api.connections.list,
    status === "in" ? {} : "skip",
  );
  const bakes = useQuery(
    api.bakes.listByPerson,
    status === "in" && userId
      ? { userId: userId as Id<"users"> }
      : "skip",
  );

  if (status === "checking") {
    return <p role="status">Opening the book…</p>;
  }
  if (status === "out" || !user) {
    return <RedirectToJoin />;
  }

  const person = connections?.find(
    (member) => member.otherUserId === userId,
  );
  const called =
    userId === user._id ? user.called : (person?.called ?? "Family");

  return (
    <div>
      <PageTitle title={`${called} · ${SITE_SHORT}`} />
      <p>
        <Link
          to={keep("/")}
          className="min-h-12 inline-flex items-center underline decoration-rule underline-offset-4 hover:text-cinnamon-deep"
        >
          Back to the book
        </Link>
      </p>
      <h1 className="font-display mt-3 text-[2.4rem] leading-[1.1] tracking-tight">
        {called}
      </h1>
      <p className="mt-3 text-[19px] leading-8 text-ink-soft">
        The recipes they shared.
      </p>
      {bakes === undefined ? (
        <p role="status" className="mt-8">
          Looking through the recipes…
        </p>
      ) : (
        <div className="mt-8">
          <CookbookExplorer
            bakes={bakes}
            selfId={user?._id}
            emptyNote={`Hmm. Nothing from ${called} yet.`}
          />
        </div>
      )}
    </div>
  );
}
