import { useId, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { BakeKind } from "../../convex/lib/kinds";
import { KIND_LABELS } from "../../convex/lib/kinds";
import {
  bakeKind,
  filterCookbook,
  kindsInCookbook,
  type CookbookBake,
  type CookbookSort,
} from "@/lib/cookbook";
import { formatBakeDate } from "@/lib/dates";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Kicker } from "@/components/Kicker";

const SORTS: Array<{ id: CookbookSort; label: string }> = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "az", label: "A to Z" },
];

function isSort(value: string | null): value is CookbookSort {
  return value === "newest" || value === "oldest" || value === "az";
}

function isKind(value: string | null): value is BakeKind {
  return value !== null && value in KIND_LABELS;
}

export function CookbookExplorer({ bakes }: { bakes: CookbookBake[] }) {
  const [params, setParams] = useSearchParams();
  const searchId = useId();
  const countId = useId();
  const query = params.get("q") ?? "";
  const sortParam = params.get("sort");
  const kindParam = params.get("kind");
  const sort: CookbookSort = isSort(sortParam) ? sortParam : "newest";
  const kind: BakeKind | "all" = isKind(kindParam) ? kindParam : "all";

  const [filtersOpen, setFiltersOpen] = useState(false);
  const trays = useMemo(() => kindsInCookbook(bakes), [bakes]);
  const latestSlug = useMemo(() => {
    const newest = [...bakes].sort((a, b) => b.bakedOn.localeCompare(a.bakedOn))[0];
    return newest?.slug;
  }, [bakes]);
  const results = useMemo(
    () => filterCookbook(bakes, query, kind, sort),
    [bakes, query, kind, sort],
  );
  const featured = results.find((bake) => bake.slug === latestSlug);
  const rest = results.filter((bake) => bake.slug !== featured?.slug);

  function update(next: { q?: string; kind?: string; sort?: string }) {
    const nextParams = new URLSearchParams(params);
    const q = next.q ?? query;
    const nextKind = next.kind ?? kind;
    const nextSort = next.sort ?? sort;
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
    setParams(nextParams, { replace: true });
  }

  const countLabel =
    results.length === 1
      ? "1 bake"
      : `${results.length} bakes`;

  return (
    <section aria-labelledby="cookbook-index-heading">
      <Kicker>The cookbook</Kicker>
      <h1
        id="cookbook-index-heading"
        className="font-display mt-3 text-[2.15rem] leading-[1.12] tracking-tight md:text-[3.2rem]"
      >
        Find a bake
      </h1>
      <p className="mt-3 max-w-[36rem] text-[19px] leading-8 text-ink-soft">
        Chris writes the notes. Start with what&apos;s just out of the oven,
        or pick a tray. Search if you already know the one.
      </p>

      <form
        role="search"
        className="sticky top-0 z-10 mt-8 -mx-2 border-b border-rule bg-paper px-2 py-3"
        onSubmit={(event) => event.preventDefault()}
      >
        <Label htmlFor={searchId}>Search the notes</Label>
        <Input
          id={searchId}
          type="search"
          value={query}
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Spice, banana, chocolate…"
          aria-describedby={countId}
          className="mt-2 min-h-14"
          onChange={(event) => update({ q: event.target.value })}
        />
        <Button
          type="button"
          variant="secondary"
          className="mt-3 w-full justify-between px-4 md:hidden"
          aria-expanded={filtersOpen}
          aria-controls="cookbook-filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <span>
            {filtersOpen
              ? "Hide filters"
              : kind !== "all"
                ? `Filter and sort · ${KIND_LABELS[kind]}`
                : "Filter and sort"}
          </span>
          <span aria-hidden="true" className="text-[22px] leading-none">
            {filtersOpen ? "−" : "+"}
          </span>
        </Button>

        <div
          id="cookbook-filters"
          className={[
            "mt-5 flex-col gap-5 md:flex md:flex-row md:items-end md:justify-between",
            filtersOpen ? "flex" : "hidden md:flex",
          ].join(" ")}
        >
          <div>
            <p id="tray-filter-label" className="text-[16px] font-medium text-ink-soft">
              What&apos;s on the tray
            </p>
            <div
              role="group"
              aria-labelledby="tray-filter-label"
              className="mt-2 flex flex-wrap gap-2"
            >
              <FilterChip
                pressed={kind === "all"}
                onClick={() => update({ kind: "all" })}
              >
                All
              </FilterChip>
              {trays.map((tray) => (
                <FilterChip
                  key={tray}
                  pressed={kind === tray}
                  onClick={() => update({ kind: tray })}
                >
                  {KIND_LABELS[tray]}
                </FilterChip>
              ))}
            </div>
          </div>
          <div className="w-full md:max-w-[14rem]">
            <Label htmlFor="cookbook-sort">Sort</Label>
            <Select
              id="cookbook-sort"
              className="mt-2"
              value={sort}
              onChange={(event) => update({ sort: event.target.value })}
            >
              {SORTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </form>

      <p id={countId} role="status" className="mt-2 text-[17px] text-ink-soft">
        {query || kind !== "all" ? `${countLabel} match` : `${countLabel} in the book`}
      </p>

      {results.length === 0 ? (
        <p className="mt-8 max-w-[32rem] text-[19px] leading-8">
          Nothing matches that. Try a word from the notes — spice, banana,
          chocolate — or pick All on the tray.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-10">
          {featured ? (
            <section aria-labelledby="just-baked-heading">
              <h2
                id="just-baked-heading"
                className="font-display text-[1.55rem] leading-8 tracking-tight md:text-[1.75rem]"
              >
                Just baked
              </h2>
              <FeaturedCard bake={featured} />
            </section>
          ) : null}

          {rest.length > 0 ? (
            <TrayGrid
              heading={
                featured
                  ? kind === "all" && !query
                    ? "On the tray"
                    : "Also matching"
                  : "Matching bakes"
              }
              headingId="tray-grid"
              bakes={rest}
              showKind={kind === "all"}
            />
          ) : null}
        </div>
      )}

      <p className="mt-12 max-w-[36rem] text-[17px] leading-7 text-ink-soft">
        This is Chris&apos;s book. Pick a bake, cook from her notes, come back
        for the next one.
      </p>
    </section>
  );
}

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={[
        "inline-flex min-h-12 cursor-pointer items-center rounded-lg px-4 text-[17px] font-medium touch-manipulation transition-colors duration-150",
        pressed
          ? "btn-primary hover:bg-cocoa"
          : "border-[1.5px] border-cocoa bg-transparent text-ink hover:border-cinnamon-deep hover:bg-paper-raised active:bg-[#efe6d8]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function bakeHook(bake: CookbookBake) {
  return bake.changes[0]
    ? `${bake.changes[0].move}: ${bake.changes[0].change}`
    : bake.outcome;
}

function FeaturedCard({ bake }: { bake: CookbookBake }) {
  const kind = bakeKind(bake);
  const hook = bakeHook(bake);

  return (
    <article className="mt-4 overflow-hidden rounded-lg border border-rule border-l-[3px] border-l-cinnamon bg-paper-raised">
      {bake.photoUrl ? (
        <img
          src={bake.photoUrl}
          alt=""
          className="aspect-[4/3] w-full object-cover md:aspect-[16/9]"
        />
      ) : null}
      <div className="px-5 py-5 md:px-6 md:py-6">
        <p className="text-[16px] font-medium text-ink-soft">
          {KIND_LABELS[kind]}
        </p>
        <h3 className="font-display mt-2 text-[1.85rem] leading-9 tracking-tight md:text-[2.25rem]">
          {bake.title}
        </h3>
        {hook ? (
          <p className="mt-2 text-[18px] leading-7 text-ink-soft italic">{hook}</p>
        ) : null}
        <time className="mt-3 block text-[17px] text-ink-soft" dateTime={bake.bakedOn}>
          {formatBakeDate(bake.bakedOn)}
        </time>
        <ButtonLink to={`/bakes/${bake.slug}`} className="mt-5 w-full sm:w-auto">
          Open this bake
        </ButtonLink>
      </div>
    </article>
  );
}

function TrayGrid({
  heading,
  headingId,
  bakes,
  showKind,
}: {
  heading: string;
  headingId: string;
  bakes: CookbookBake[];
  showKind: boolean;
}) {
  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="font-display text-[1.55rem] leading-8 tracking-tight md:text-[1.75rem]"
      >
        {heading}
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {bakes.map((bake) => (
          <BakeCard key={bake.slug} bake={bake} showKind={showKind} />
        ))}
      </ul>
    </section>
  );
}

function BakeCard({
  bake,
  showKind,
}: {
  bake: CookbookBake;
  showKind: boolean;
}) {
  const kind = bakeKind(bake);
  const hook = bakeHook(bake);

  return (
    <li>
      <Link
        to={`/bakes/${bake.slug}`}
        className="group flex h-full min-h-36 cursor-pointer flex-col overflow-hidden rounded-lg border-[1.5px] border-cocoa bg-paper-raised touch-manipulation transition-colors duration-150 hover:border-cinnamon-deep hover:bg-paper active:border-ink active:bg-[#efe6d8]"
      >
        {bake.photoUrl ? (
          <img
            src={bake.photoUrl}
            alt=""
            className="aspect-[4/3] w-full object-cover"
          />
        ) : null}
        <span className="flex flex-1 flex-col px-4 py-4">
          {showKind ? (
            <span className="text-[16px] font-medium text-ink-soft">
              {KIND_LABELS[kind]}
            </span>
          ) : null}
          <span
            className={[
              "font-display text-[1.4rem] leading-8 tracking-tight md:text-[1.55rem] group-hover:underline group-hover:decoration-rule group-hover:underline-offset-4",
              showKind ? "mt-2" : "",
            ].join(" ")}
          >
            {bake.title}
          </span>
          {hook ? (
            <span className="mt-2 text-[17px] leading-7 text-ink-soft italic">
              {hook}
            </span>
          ) : null}
          <span className="mt-auto flex items-end justify-between gap-3 pt-4">
            <time className="text-[16px] text-ink-soft" dateTime={bake.bakedOn}>
              {formatBakeDate(bake.bakedOn)}
            </time>
            <span className="text-[17px] font-medium underline decoration-rule underline-offset-4 group-hover:text-cinnamon-deep group-hover:decoration-cinnamon-deep">
              Open
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}
