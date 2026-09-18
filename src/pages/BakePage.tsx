import { useQuery } from "convex/react";
import { useParams } from "react-router";
import { api } from "../../convex/_generated/api";
import { Kicker } from "@/components/Kicker";
import { PageTurn } from "@/components/PageTurn";
import { PhotoFrame } from "@/components/PhotoFrame";
import { SallyCredit } from "@/components/SallyCredit";
import { SecretSauce } from "@/components/SecretSauce";
import { CookbookBack } from "@/components/CookbookBack";
import { KitchenMethod } from "@/components/KitchenMethod";
import { KitchenAsk } from "@/components/KitchenAsk";
import { formatBakeDate } from "@/lib/dates";
import { inferKind, KIND_LABELS } from "../../convex/lib/kinds";
import { PageTitle } from "@/lib/pageTitle";
import { SITE_NAME, SITE_SHORT } from "@/lib/site";

export function BakePage() {
  const { slug } = useParams();
  const bake = useQuery(
    api.bakes.getPublishedBySlug,
    slug ? { slug } : "skip",
  );
  const catalog = useQuery(api.bakes.listPublished);
  const photos = useQuery(
    api.photos.listForBake,
    bake ? { bakeId: bake._id } : "skip",
  );

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
        <PageTitle title={`Not in the cookbook · ${SITE_SHORT}`} />
        <p className="text-ink-soft">That bake isn&apos;t in the cookbook.</p>
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
  const index = catalog?.findIndex((item) => item.slug === bake.slug) ?? -1;
  const newer = index > 0 ? catalog?.[index - 1] : null;
  const older = index >= 0 ? catalog?.[index + 1] : null;

  const kind = bake.kind ?? inferKind(bake.title, bake.sourceTitle);

  return (
    <article>
      <PageTitle title={`${bake.title} · ${SITE_SHORT}`} />
      <CookbookBack />
      {heroSrc ? (
        <PhotoFrame
          src={heroSrc}
          alt={heroAlt}
          size="hero"
          className="mt-8"
        />
      ) : null}

      <Kicker className={heroSrc ? undefined : "mt-8"}>
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
        <SallyCredit title={bake.sourceTitle} url={bake.sourceUrl} />
      </div>

      <div className="mt-10 flex flex-col gap-8 md:grid md:grid-cols-[1.08fr_0.92fr] md:items-start md:gap-10">
        <KitchenMethod
          method={bake.method}
          sourceTitle={bake.sourceTitle}
          sourceUrl={bake.sourceUrl}
        />
        <SecretSauce changes={bake.changes} />
      </div>

      <div className="mt-10 flex max-w-[38rem] flex-col gap-5">
        {firstParagraph ? (
          <p className="drop-cap">{firstParagraph}</p>
        ) : null}
        {restParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {bake.outcome ? (
          <p className="mt-2 border-t border-rule pt-5 font-display text-[1.25rem] leading-8 text-cocoa italic">
            {bake.outcome}
          </p>
        ) : null}
      </div>

      <KitchenAsk
        title={bake.title}
        sourceTitle={bake.sourceTitle}
        bakerName={bake.bakerName}
        outcome={bake.outcome}
        changes={bake.changes}
      />

      <PageTurn older={older} newer={newer} />
    </article>
  );
}
