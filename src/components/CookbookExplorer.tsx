import { useEffect, useId, useMemo, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import type { Id } from "../../convex/_generated/dataModel";
import type { BakeKind } from "../../convex/lib/kinds";
import { KIND_LABELS } from "../../convex/lib/kinds";
import {
  accordingTo,
  madeByOthersLine,
  bakeIsWhose,
  bakeKind,
  bakeStars,
  filterCookbook,
  ingredientHits,
  kindsInCookbook,
  type CookbookBake,
  type CookbookSort,
} from "@/lib/cookbook";
import { BakeStars } from "@/components/BakeStars";
import { splitWhoQuery, type MixPerson } from "@/lib/cookbookMix";
import { formatBakeDate } from "@/lib/dates";
import { FilterSort, FilterSorts, FilterTab, FilterTabs } from "@/components/BookFilters";
import { BakePlate } from "@/components/BakePlate";
import { RecipeShare } from "@/components/RecipeShare";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SORTS: Array<{ id: CookbookSort; label: string }> = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "az", label: "A to Z" },
];

const STAR_FILTERS = [5, 4, 3, 2, 1] as const;

function isStars(value: string | null): value is "1" | "2" | "3" | "4" | "5" {
  return value === "1" || value === "2" || value === "3" || value === "4" || value === "5";
}

function isSort(value: string | null): value is CookbookSort {
  return value === "newest" || value === "oldest" || value === "az";
}

function isKind(value: string | null): value is BakeKind {
  return value !== null && value in KIND_LABELS;
}

export function CookbookExplorer({
  bakes,
  hasFamily = false,
  people = [],
  selfId,
  selfCalled,
  whose,
  emptyNote,
}: {
  bakes: CookbookBake[];
  hasFamily?: boolean;
  people?: MixPerson[];
  selfId?: string;
  selfCalled?: string;
  whose?: ReactNode;
  emptyNote?: string;
}) {
  const [params, setParams] = useSearchParams();
  const searchId = useId();
  const countId = useId();
  const query = params.get("q") ?? "";
  const sortParam = params.get("sort");
  const kindParam = params.get("kind");
  const sort: CookbookSort = isSort(sortParam) ? sortParam : "newest";
  const kind: BakeKind | "all" = isKind(kindParam) ? kindParam : "all";
  const starsParam = params.get("stars");
  const stars: number | "all" = isStars(starsParam) ? Number(starsParam) : "all";
  const mineOnly = params.get("mine") === "1";

  const { who, rest } = useMemo(
    () =>
      splitWhoQuery(query, people, {
        id: selfId,
        called: selfCalled,
      }),
    [people, query, selfCalled, selfId],
  );
  const scoped = useMemo(
    () => (who ? bakes.filter((bake) => bakeIsWhose(bake, who)) : bakes),
    [bakes, who],
  );
  const trays = useMemo(() => kindsInCookbook(scoped), [scoped]);
  const shownKind = kind !== "all" && trays.includes(kind) ? kind : "all";
  const results = useMemo(
    () => filterCookbook(scoped, rest, shownKind, sort, stars),
    [rest, scoped, shownKind, sort, stars],
  );

  useEffect(() => {
    if (kind !== shownKind) {
      write({ kind: shownKind });
    }
    // write is stable enough for this URL cleanup; kind/trays drive it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, shownKind]);


  function write(next: {
    q?: string;
    kind?: string;
    sort?: string;
    stars?: number | "all";
  }) {
    const nextParams = new URLSearchParams(params);
    const q = next.q ?? query;
    const nextKind = next.kind ?? kind;
    const nextSort = next.sort ?? sort;
    const nextStars = next.stars ?? stars;
    if (q.trim().length > 0) {
      nextParams.set("q", q);
    } else {
      nextParams.delete("q");
    }
    if (nextKind !== "all") {
      nextParams.set("kind", nextKind);
    } else {
      nextParams.delete("kind");
    }
    if (nextSort !== "newest") {
      nextParams.set("sort", nextSort);
    } else {
      nextParams.delete("sort");
    }
    if (nextStars !== "all") {
      nextParams.set("stars", String(nextStars));
    } else {
      nextParams.delete("stars");
    }
    setParams(nextParams, { replace: true });
  }

  return (
    <section
      className="book-explorer"
      aria-labelledby="cookbook-index-heading"
    >
      <form
        role="search"
        className="book-portal-lintel"
        onSubmit={(event) => event.preventDefault()}
      >
        <Label htmlFor={searchId} id="cookbook-index-heading">
          Search an ingredient, a person, or stars
        </Label>
        <Input
          id={searchId}
          type="search"
          value={query}
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Pumpkin, 5 stars, Nana…"
          aria-describedby={countId}
          className="book-search mt-1 min-h-14 rounded-[4px] px-3 outline-offset-4"
          onChange={(event) => write({ q: event.target.value })}
        />
        {whose}
        <div className="book-index book-index-tray">
          <FilterTabs labelledBy="tray-filter-label">
            <p id="tray-filter-label" className="sr-only">
              What&apos;s on the tray
            </p>
            <FilterTab
              checked={shownKind === "all"}
              onChange={() => write({ kind: "all" })}
            >
              All
            </FilterTab>
            {trays.map((tray) => (
              <FilterTab
                key={tray}
                checked={shownKind === tray}
                onChange={() => write({ kind: tray })}
              >
                {KIND_LABELS[tray]}
              </FilterTab>
            ))}
          </FilterTabs>
          <FilterSorts label="Sort">
            {SORTS.map((option) => (
              <FilterSort
                key={option.id}
                checked={sort === option.id}
                onChange={() => write({ sort: option.id })}
              >
                {option.label}
              </FilterSort>
            ))}
          </FilterSorts>
        </div>
        <div className="book-index book-index-stars">
          <FilterTabs labelledBy="star-filter-label">
            <p id="star-filter-label" className="sr-only">
              Their rating
            </p>
            <FilterTab
              checked={stars === "all"}
              onChange={() => write({ stars: "all" })}
            >
              Any stars
            </FilterTab>
            {STAR_FILTERS.map((count) => (
              <FilterTab
                key={count}
                checked={stars === count}
                label={`${count} ${count === 1 ? "star" : "stars"}`}
                onChange={() => write({ stars: count })}
              >
                {`${count} ${count === 1 ? "star" : "stars"}`}
              </FilterTab>
            ))}
          </FilterTabs>
        </div>
      </form>

      <div
        className="book-portal book-portal-scrollable"
        aria-labelledby={countId}
      >
        <div className="book-portal-stack" aria-hidden="true" />
        <div className="book-portal-stack book-portal-stack-2" aria-hidden="true" />
        <div className="book-portal-well book-portal-well-scrollable">
          {results.length === 0 ? (
            <div className="book-portal-empty">
              <PortalMiss
                query={query}
                who={who?.called}
                emptyNote={
                  bakes.length === 0 && rest.trim().length === 0
                    ? emptyNote
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="book-portal-grid" role="list">
              {results.map((bake) => (
                <PortalCard
                  key={bake._id || bake.slug}
                  bake={bake}
                  query={rest}
                  selfId={selfId}
                  search={params.toString()}
                />
              ))}
            </div>
          )}

          <div className="book-portal-footer">

            <p id={countId} role="status" className="book-portal-count">
              {results.length === 0
                ? query
                  ? "Nothing uses that"
                  : "The tray’s empty"
                : who && rest
                  ? `${results.length} · ${who.called} · “${rest}”`
                  : who
                    ? `${results.length} · ${who.called}`
                    : rest
                      ? `${results.length} with “${rest}”`
                      : stars !== "all"
                        ? `${results.length} · ${stars}★`
                        : mineOnly && hasFamily
                          ? `${results.length} · just yours`
                          : `${results.length}`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function missLine(query: string, who?: string) {
  if (who) {
    const notes = [
      `${who} hasn’t left that one.`,
      `Not in ${who}’s pages.`,
      `${who} would remember if we’d made it.`,
    ];
    return notes[query.length % notes.length] ?? notes[0];
  }
  const notes = [
    "Not on these pages.",
    "We haven’t made that yet.",
    "Hmm. Not in this batch.",
    "That one’s still in somebody’s head.",
    "Nothing with that in the book.",
  ];
  let hash = 0;
  for (const char of query) {
    hash = (hash + char.charCodeAt(0)) % notes.length;
  }
  return notes[hash] ?? notes[0];
}

function PortalMiss({
  query,
  who,
  emptyNote,
}: {
  query: string;
  who?: string;
  emptyNote?: string;
}) {
  return (
    <div className="book-portal-miss">
      <svg
        className="book-portal-miss-mark"
        viewBox="0 0 88 56"
        aria-hidden="true"
      >
        <ellipse
          cx="44"
          cy="34"
          rx="30"
          ry="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M20 28c6-10 16-16 24-16s18 6 24 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M36 22c2 3 6 4 10 1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <p className="book-portal-miss-note">
        {emptyNote ?? missLine(query, who)}
      </p>
    </div>
  );
}

function fromWhoseBook(bake: CookbookBake, selfId?: string) {
  if (!selfId || !bake.ownerId || bake.ownerId === selfId) {
    return null;
  }
  return `${bake.bakerName}'s`;
}

function bakeHook(bake: CookbookBake) {
  const first = bake.changes[0];
  if (!first) {
    return bake.outcome;
  }
  return first.change ? `${first.move} ${first.change}` : first.move;
}

function PortalCard({
  bake,
  query,
  selfId,
  search,
}: {
  bake: CookbookBake;
  query: string;
  selfId?: string;
  search: string;
}) {
  const kind = bakeKind(bake);
  const hook = bakeHook(bake);
  const hits = ingredientHits(bake, query);
  const whose = fromWhoseBook(bake, selfId);
  const madeLine = madeByOthersLine(bake.madeByOthers);

  return (
    <article className="book-portal-results" role="listitem">
      <div className="book-portal-frame">
        {bake.photoUrl ? (
          <img src={bake.photoUrl} alt="" />
        ) : (
          <BakePlate kind={kind} seed={bake.slug} />
        )}
        {bake._id ? (
          <RecipeShare
            className="recipe-share-on-photo"
            bakeId={bake._id as Id<"bakes">}
            title={bake.title}
          />
        ) : null}
      </div>
      <div className="book-portal-copy">
        <p className="text-[16px] font-medium leading-6 text-ink-soft">
          {KIND_LABELS[kind]}
          {whose ? ` · ${whose}` : ""}
        </p>
        <h2 className="font-display mt-0.5 text-[1.7rem] leading-8 tracking-tight md:text-[2rem]">
          {bake.title}
        </h2>
        {bakeStars(bake) > 0 ? (
          <p className="book-portal-rating">
            <BakeStars value={bakeStars(bake)} size="card" />
            <span className="book-portal-according">
              {accordingTo(bake, selfId) ?? `According to ${bake.bakerName}`}
            </span>
          </p>
        ) : null}
        {hits.length > 0 ? (
          <p className="mt-1 text-[17px] leading-6 text-ink-soft">{hits[0]}</p>
        ) : hook ? (
          <p className="mt-1 text-[17px] leading-6 text-ink-soft italic">{hook}</p>
        ) : null}
        {madeLine ? <p className="book-portal-made">{madeLine}</p> : null}
        <div className="book-portal-actions">
          <time className="text-[16px] leading-6 text-ink-soft" dateTime={bake.bakedOn}>
            {formatBakeDate(bake.bakedOn)}
          </time>
          <Link
            to={{ pathname: `/bakes/${bake.slug}`, search }}
            className="book-portal-make"
          >
            View recipe
          </Link>
        </div>
      </div>
    </article>
  );
}
