import { useQuery } from "convex/react";
import { useParams, useSearchParams } from "react-router";
import { api } from "../../convex/_generated/api";
import { Kicker } from "@/components/Kicker";
import { PageTurn } from "@/components/PageTurn";
import { BakePlate } from "@/components/BakePlate";
import { PhotoFrame } from "@/components/PhotoFrame";
import { RecipeSource } from "@/components/RecipeSource";
import { SecretSauce } from "@/components/SecretSauce";
import { CookbookBack } from "@/components/CookbookBack";
import { RecipeShare } from "@/components/RecipeShare";
import { KitchenMethod } from "@/components/KitchenMethod";
import { BakeStars } from "@/components/BakeStars";
import { KitchenAsk } from "@/components/KitchenAsk";
import { HowItWent } from "@/components/HowItWent";
import { formatBakeDate } from "@/lib/dates";
import { accordingTo } from "@/lib/cookbook";
import { inferKind, KIND_LABELS } from "../../convex/lib/kinds";
import { PageTitle } from "@/lib/pageTitle";
import { SITE_NAME, SITE_SHORT } from "@/lib/site";
import { useFamily } from "@/lib/family";
import { useRecipeTitle } from "@/lib/bookHeading";
import { RedirectToJoin } from "@/components/RedirectToJoin";
import { useCookbookView } from "@/lib/preview";

export function BakePage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { status } = useFamily();
  const view = useCookbookView();
  const bake = useQuery(
    api.bakes.getPublishedBySlug,
    status === "in" && slug ? { slug } : "skip",
  );
  const catalog = view.bakes;
  const teaser = catalog?.find((item) => item.slug === slug);
  const photos = useQuery(
    api.photos.listForBake,
    bake ? { bakeId: bake._id } : "skip",
  );
  useRecipeTitle(
    (bake && "title" in bake ? bake.title : null) ?? teaser?.title ?? null,
  );

  if (status === "checking") {
    return (
      <>
        <PageTitle title={SITE_NAME} />
        <p role="status">Opening this bake…</p>
      </>
    );
  }

  if (status === "out") {
    return <RedirectToJoin />;
  }

  if (bake === undefined) {
    return (
      <>
        <PageTitle title={SITE_NAME} />
        <p role="status">Opening this bake…</p>
      </>
    );
  }

  if (bake === null) {
    return (
      <>
        <PageTitle title={`Not in the recipe book · ${SITE_SHORT}`} />
        <p className="text-ink-soft">That card isn&apos;t in the book.</p>
        <p className="mt-6">
          <CookbookBack />
        </p>
      </>
    );
  }

  const hero = photos?.[0];
  const heroSrc = hero?.url ?? bake.coverUrl;
  const heroAlt = hero?.alt || bake.title;
  const [firstParagraph, ...restParagraphs] = bake.story
    .split("\n")
    .filter((line) => line.length > 0);
  const index = catalog?.findIndex((item) => item._id === bake._id) ?? -1;
  const newer = index > 0 ? catalog?.[index - 1] : null;
  const older = index >= 0 ? catalog?.[index + 1] : null;

  const kind = bake.kind ?? inferKind(bake.title, bake.sourceTitle);

  return (
    <article>
      <PageTitle title={`${bake.title} · ${SITE_SHORT}`} />
      <div className="bake-leaf-bar">
        <CookbookBack />
        <RecipeShare bakeId={bake._id} title={bake.title} />
      </div>
      {heroSrc ? (
        <PhotoFrame
          src={heroSrc}
          alt={heroAlt}
          size="hero"
          className="mt-8"
        />
      ) : (
        <div className="book-portal-frame book-plate-hero mt-8">
          <BakePlate kind={kind} seed={bake.slug} />
        </div>
      )}

      <Kicker className="mt-6">
        {KIND_LABELS[kind]}
        {" · "}
        {bake.bakerName}
        {" · "}
        <time dateTime={bake.bakedOn}>{formatBakeDate(bake.bakedOn)}</time>
      </Kicker>
      <h1 className="font-display mt-3 text-[2.15rem] leading-[1.12] tracking-tight md:text-[3.4rem]">
        {bake.title}
      </h1>
      <div className="mt-4">
        <RecipeSource
          sourceKind={bake.sourceKind}
          sourceTitle={bake.sourceTitle}
          sourceUrl={bake.sourceUrl}
        />
      </div>

      <div className="mt-10">
        <KitchenMethod
          makes={bake.makes}
          ingredients={bake.ingredients}
          steps={bake.steps}
          method={bake.method}
          sourceTitle={bake.sourceTitle}
          sourceUrl={bake.sourceUrl}
        />
      </div>

      <div className="mt-10 flex flex-col gap-8 md:grid md:grid-cols-[1.15fr_0.85fr] md:items-start md:gap-10">
        <div className="flex max-w-[40rem] flex-col gap-5">
          {firstParagraph ? (
            <p className="drop-cap">{firstParagraph}</p>
          ) : null}
          {restParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {bake.rating > 0 ? (
            <div className="mt-2 border-t border-rule pt-5">
              <p className="book-according">
                {accordingTo(bake, view.selfId) ?? `According to ${bake.bakerName}`}
              </p>
              <BakeStars value={bake.rating} />
            </div>
          ) : null}
          {bake.outcome ? (
            <p className="mt-2 font-display text-[1.25rem] leading-8 text-cocoa italic">
              {bake.outcome}
            </p>
          ) : null}
        </div>
        <SecretSauce changes={bake.changes} />
      </div>

      <KitchenAsk
        title={bake.title}
        sourceTitle={bake.sourceTitle}
        bakerName={bake.bakerName}
        outcome={bake.outcome}
        changes={bake.changes}
      />

      <HowItWent bakeId={bake._id} />

      <PageTurn older={older} newer={newer} search={params.toString()} />
    </article>
  );
}
