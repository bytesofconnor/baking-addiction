import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  madeByOthersLine,
  bakeIsWhose,
  bakeKind,
  filterCookbook,
  ingredientHits,
  type CookbookBake,
  type CookbookSort,
} from "@/lib/cookbook";
import { splitWhoQuery, type MixPerson } from "@/lib/cookbookMix";
import { formatAddedShort } from "@/lib/dates";
import { FilterSort, FilterSorts } from "@/components/BookFilters";
import { BakePlate } from "@/components/BakePlate";
import { RecipeShare } from "@/components/RecipeShare";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFamily } from "@/lib/family";

const SORTS: Array<{ id: CookbookSort; label: string }> = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "az", label: "A to Z" },
];

function isSort(value: string | null): value is CookbookSort {
  return value === "newest" || value === "oldest" || value === "az";
}

export function CookbookExplorer({
  bakes,
  refreshing = false,
  hasFamily = false,
  people = [],
  selfId,
  selfCalled,
  whose,
  emptyNote,
}: {
  bakes: CookbookBake[];
  refreshing?: boolean;
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
  const sort: CookbookSort = isSort(sortParam) ? sortParam : "newest";
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
  const results = useMemo(
    () => filterCookbook(scoped, rest, "all", sort),
    [rest, scoped, sort],
  );

  useEffect(() => {
    if (params.has("kind") || params.has("stars")) {
      write({});
    }
    // Clear retired filter params from older links.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function write(next: {
    q?: string;
    sort?: string;
  }) {
    const nextParams = new URLSearchParams(params);
    const q = next.q ?? query;
    const nextSort = next.sort ?? sort;
    if (q.trim().length > 0) {
      nextParams.set("q", q);
    } else {
      nextParams.delete("q");
    }
    if (nextSort !== "newest") {
      nextParams.set("sort", nextSort);
    } else {
      nextParams.delete("sort");
    }
    nextParams.delete("kind");
    nextParams.delete("stars");
    setParams(nextParams, { replace: true });
  }

  return (
    <section
      className="book-explorer"
      aria-labelledby="cookbook-index-heading"
      aria-busy={refreshing || undefined}
    >
      <form
        role="search"
        className="book-portal-lintel"
        onSubmit={(event) => event.preventDefault()}
      >
        <Label htmlFor={searchId} id="cookbook-index-heading">
          Search recipes
        </Label>
        <Input
          id={searchId}
          type="search"
          value={query}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          inputMode="search"
          placeholder="Pumpkin, bread, chocolate…"
          aria-describedby={countId}
          className="book-search mt-1 min-h-14 rounded-[4px] px-3 outline-offset-4"
          onChange={(event) => write({ q: event.target.value })}
        />
      </form>
      <div className="book-filter-tray">
        {whose}
        <div className="book-index book-index-tray">
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
      </div>

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
                welcome={bakes.length === 0 && rest.trim().length === 0}
              />
            </div>
          ) : (
            <div className="book-portal-grid" role="list">
              {results.map((bake) => (
                <PortalCard
                  key={bake._id || bake.slug}
                  bake={bake}
                  query={rest}
                  search={params.toString()}
                />
              ))}
            </div>
          )}

          <div className="book-portal-footer">
            {results.length === 0 && !query ? null : (
              <p
                id={countId}
                role="status"
                aria-live="polite"
                className="book-portal-count"
              >
                {results.length === 0
                  ? "Nothing uses that"
                  : who && rest
                    ? `${results.length} · ${who.called} · “${rest}”`
                    : who
                      ? `${results.length} · ${who.called}`
                      : rest
                        ? `${results.length} with “${rest}”`
                        : mineOnly && hasFamily
                            ? `${results.length} · just yours`
                            : `${results.length}`}
              </p>
            )}
            {results.length === 0 && !query ? (
              <span id={countId} className="sr-only">
                Your book is empty
              </span>
            ) : null}
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
  welcome = false,
}: {
  query: string;
  who?: string;
  emptyNote?: string;
  welcome?: boolean;
}) {
  return (
    <div className="book-portal-miss">
      <svg
        className="book-portal-miss-mark"
        viewBox="0 0 96 72"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Empty plate — rim + well, easy to read at a glance */}
        <ellipse cx="48" cy="40" rx="34" ry="18" strokeWidth="2.2" />
        <ellipse cx="48" cy="38" rx="22" ry="11" strokeWidth="1.8" />
        {/* Tiny steam curls so it feels “kitchen,” not just a circle */}
        <path d="M38 18c0-4 3-6 3-10" strokeWidth="1.8" />
        <path d="M48 16c0-4 3-6 3-10" strokeWidth="1.8" />
        <path d="M58 18c0-4 3-6 3-10" strokeWidth="1.8" />
      </svg>
      <p
        className="book-portal-miss-note"
        data-welcome={welcome ? "true" : undefined}
      >
        {emptyNote ?? missLine(query, who)}
      </p>
    </div>
  );
}

function bakeHook(bake: CookbookBake) {
  const note = bake.outcome?.trim();
  return note && note.length > 0 ? note : null;
}

function PortalCard({
  bake,
  query,
  search,
}: {
  bake: CookbookBake;
  query: string;
  search: string;
}) {
  const { status } = useFamily();
  const [warm, setWarm] = useState(false);
  const titleId = useId();
  // Warm the full bake while the card is hovered/focused so the leaf turn
  // reveals the recipe instead of an “Opening…” flash after the flip.
  useQuery(
    api.bakes.getPublishedBySlug,
    warm && status === "in" ? { slug: bake.slug } : "skip",
  );
  const kind = bakeKind(bake);
  const hook = bakeHook(bake);
  const hits = ingredientHits(bake, query);
  const madeLine = madeByOthersLine(bake.madeByOthers);
  const href = { pathname: `/bakes/${bake.slug}`, search };
  const warmHandlers = {
    onPointerEnter: () => setWarm(true),
    onPointerDown: () => setWarm(true),
    onFocus: () => setWarm(true),
  };

  return (
    <article
      className="book-portal-results"
      role="listitem"
      aria-labelledby={titleId}
    >
      <div className="book-portal-frame">
        {bake.photoUrl ? (
          <img
            src={bake.photoUrl}
            alt=""
            loading="lazy"
            decoding="async"
          />
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
          {bake.bakerName}
        </p>
        <h2
          id={titleId}
          className="font-display mt-0.5 text-[1.7rem] leading-8 tracking-tight md:text-[2rem]"
        >
          <Link to={href} className="book-portal-title-link" {...warmHandlers}>
            {bake.title}
          </Link>
        </h2>
        {hits.length > 0 ? (
          <p className="book-portal-hook">{hits[0]}</p>
        ) : hook ? (
          <p className="book-portal-hook book-portal-hook-note">{hook}</p>
        ) : null}
        {madeLine ? <p className="book-portal-made">{madeLine}</p> : null}
        <div className="book-portal-actions">
          <time className="text-[16px] leading-6 text-ink-soft" dateTime={bake.bakedOn}>
            {formatAddedShort(bake.bakedOn)}
          </time>
          <Link
            to={href}
            className="book-portal-make"
            aria-labelledby={titleId}
            {...warmHandlers}
          >
            View recipe
          </Link>
        </div>
      </div>
    </article>
  );
}
